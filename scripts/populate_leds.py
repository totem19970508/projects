#!/usr/bin/env python3
"""
Populate sample LED documents into the `leds` Firestore collection.

Usage:
  1. Create a service account JSON in Firebase Console -> Project Settings -> Service Accounts -> Generate new private key
  2. Save it as `serviceAccountKey.json` in this folder OR set env var GOOGLE_APPLICATION_CREDENTIALS to its path
  3. Install deps: `pip install -r ../requirements.txt`
  4. Run: `python3 populate_leds.py`

This script will upsert documents using `modelNo` as the document ID.
"""
import os
import sys
from datetime import datetime

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
except Exception as e:
    print("Missing firebase_admin. Install dependencies with: pip install -r ../requirements.txt")
    raise


def main():
    sa_path = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS', 'serviceAccountKey.json')
    if not os.path.exists(sa_path):
        print(f"Service account key not found at '{sa_path}'. Set GOOGLE_APPLICATION_CREDENTIALS or place the file there.")
        sys.exit(1)

    cred = credentials.Certificate(sa_path)
    firebase_admin.initialize_app(cred)
    db = firestore.client()

    sample_leds = [
        {
            "brand": "Everlight",
            "modelNo": "EVL-2835-RGB",
            "spec": "SMD 2835 RGB high brightness",
            "color": "RGB",
            "forwardVoltage": 3.2,
            "current": 20,
            "testCurrent": 20,
            "modeRGB": "RGB",
            "size": "2835",
            "pinCount": 4,
            "notes": "Common anode"
        },
        {
            "brand": "Nichia",
            "modelNo": "NCH-5050-WW",
            "spec": "5050 warm white",
            "color": "Warm White",
            "forwardVoltage": 2.9,
            "current": 60,
            "testCurrent": 60,
            "modeRGB": "single-color",
            "size": "5050",
            "pinCount": 2,
            "notes": "High CRI"
        },
        {
            "brand": "Kingbright",
            "modelNo": "KGB-5mm-R",
            "spec": "5mm red through-hole",
            "color": "Red",
            "forwardVoltage": 2.0,
            "current": 20,
            "testCurrent": 20,
            "modeRGB": "single-color",
            "size": "5mm",
            "pinCount": 2,
            "notes": "Through-hole LED"
        },
        {
            "brand": "Cree",
            "modelNo": "CREE-XPE2-WW",
            "spec": "XPE2 warm white",
            "color": "Warm White",
            "forwardVoltage": 3.1,
            "current": 350,
            "testCurrent": 350,
            "modeRGB": "single-color",
            "size": "SMD",
            "pinCount": 2,
            "notes": "High-power LED"
        },
        {
            "brand": "Samsung",
            "modelNo": "SAMS-LED-2835-G",
            "spec": "2835 green",
            "color": "Green",
            "forwardVoltage": 2.8,
            "current": 20,
            "testCurrent": 20,
            "modeRGB": "single-color",
            "size": "2835",
            "pinCount": 2,
            "notes": "Good brightness"
        }
    ]

    coll = db.collection('leds')
    for led in sample_leds:
        doc_id = led.get('modelNo') or f"led-{int(datetime.utcnow().timestamp())}"
        print(f"Upserting {doc_id} ...")
        coll.document(doc_id).set(led)

    print("Done. Inserted/updated sample LED documents into 'leds' collection.")


if __name__ == '__main__':
    main()
