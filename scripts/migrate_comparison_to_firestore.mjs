#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const PROJECT = "led-db-465b0";
const COLLECTION_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents/leds`;
const sourcePath = resolve(import.meta.dirname, "..", "comparison.html");
const apply = process.argv.includes("--apply");

const source = await readFile(sourcePath, "utf8");
const productsLiteral = source.match(/const products = (\[[\s\S]*?\n\s*\]);\n\n\s*const rows/)[1];
const rowsLiteral = source.match(/const rows = (\[[\s\S]*?\n\s*\])\.map\(\(r, index\)/)[1];
const products = Function(`"use strict"; return (${productsLiteral});`)();
const rawRows = Function(`"use strict"; return (${rowsLiteral});`)();

const fieldKeys = [
  "packageSizeMm", "typicalPitchRange", "viewingAngle", "operatingTemperature",
  "storageTemperature", "moistureSensitivityLevel", "waterResistance", "operatingVoltage",
  "maxDataRate", "pwmColorDepth", "maxRefreshRate", "grayScale", "maxStringLength",
  "bidirectionalCommunication", "outputCurrentRange", "maxOutputCurrentPerChannel",
  "opticalTestCurrent", "luminousIntensityRed", "luminousIntensityGreen", "luminousIntensityBlue",
  "dominantWavelengthRed", "dominantWavelengthGreen", "dominantWavelengthBlue",
  "junctionTemperature", "absoluteMaxSupplyVoltage", "esdProtectionHbm", "keyFeatures"
];

if (rawRows.length !== fieldKeys.length) throw new Error(`Expected 27 comparison rows; found ${rawRows.length}.`);

function fromFirestore(value) {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("mapValue" in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([k, v]) => [k, fromFirestore(v)]));
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(fromFirestore);
  return null;
}

function toFirestore(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestore) } };
  if (typeof value === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toFirestore(v)])) } };
  return { stringValue: String(value) };
}

function numbers(value) {
  return [...String(value).matchAll(/(?:N\/S\s*[–-]\s*)?(\d+(?:\.\d+)?)/g)].map(match => Number(match[1]));
}

function comparisonRecord(product, index) {
  const record = {
    brand: product.maker,
    partNumber: product.part,
    comparisonProductId: product.id,
    comparisonSource: "RGB LED Comparison VER 1.0",
    comparisonImportedAt: new Date().toISOString()
  };
  rawRows.forEach((row, rowIndex) => {
    const original = row[1][index];
    const normalized = row[2]?.[index] || original;
    const key = fieldKeys[rowIndex];
    record[key] = original;
    record[`${key}Normalized`] = normalized;
    if (row[3] && row[3] !== "—") record[`${key}Note`] = row[3];
  });
  record.bodySize = record.packageSizeMm;
  const current = numbers(record.opticalTestCurrent)[0];
  if (Number.isFinite(current)) for (const channel of ["R", "G", "B"]) record[`${channel}ifTyp`] = current;
  for (const [channel, key] of [["R", "luminousIntensityRed"], ["G", "luminousIntensityGreen"], ["B", "luminousIntensityBlue"]]) {
    const values = numbers(record[key]);
    if (values.length >= 2) [record[`${channel}min`], record[`${channel}max`]] = values;
    else if (values.length === 1) record[`${channel}max`] = values[0];
  }
  return record;
}

const response = await fetch(`${COLLECTION_URL}?pageSize=500`);
if (!response.ok) throw new Error(`Firestore read failed: ${response.status} ${await response.text()}`);
const livePayload = await response.json();
const documents = (livePayload.documents || []).map(document => ({
  id: document.name.split("/").pop(),
  fields: Object.fromEntries(Object.entries(document.fields || {}).map(([k, v]) => [k, fromFirestore(v)])),
  raw: document
}));

const backupPath = resolve(import.meta.dirname, `firestore-leds-backup-${new Date().toISOString().replaceAll(":", "-")}.json`);
await writeFile(backupPath, JSON.stringify(livePayload, null, 2) + "\n");

function targetFor(product) {
  const norm = value => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const exact = documents.find(doc => norm(doc.fields.brand) === norm(product.maker) && norm(doc.fields.partNumber) === norm(product.part));
  if (exact) return exact;
  if (product.id === "ns2020j6") return documents.find(doc => doc.id === "led-002");
  if (product.id === "kl2222") return documents.find(doc => doc.id === "led-004");
  return null;
}

const plan = [];
for (const [index, product] of products.entries()) {
  const target = targetFor(product);
  const desired = comparisonRecord(product, index);
  if (target && target.fields.partNumber !== product.part) {
    desired.comparisonPartNumber = product.part;
    delete desired.partNumber;
  }
  const additions = Object.fromEntries(Object.entries(desired).filter(([key]) => !(key in (target?.fields || {}))));
  const documentId = target?.id || `compare-${product.id}`;
  plan.push({ product: `${product.maker} ${product.part}`, documentId, action: target ? "merge" : "create", fieldsAdded: Object.keys(additions).length });
  if (!apply) continue;
  const params = new URLSearchParams();
  for (const key of Object.keys(additions)) params.append("updateMask.fieldPaths", key);
  const url = `${COLLECTION_URL}/${encodeURIComponent(documentId)}?${params}`;
  const writeResponse = await fetch(url, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(additions).map(([k, v]) => [k, toFirestore(v)])) })
  });
  if (!writeResponse.ok) throw new Error(`Write failed for ${documentId}: ${writeResponse.status} ${await writeResponse.text()}`);
}

console.table(plan);
console.log(`Backup: ${backupPath}`);
console.log(apply ? "Migration applied." : "Dry run only. Re-run with --apply to write changes.");
