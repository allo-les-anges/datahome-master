import xml.etree.ElementTree as ET
import csv

# Fichiers
FICHIER_XML = "feed_blanca_calida.xml"
FICHIER_CSV = "descriptions_a_traduire.csv"

# Charger le XML
tree = ET.parse(FICHIER_XML)
root = tree.getroot()

# Extraire toutes les descriptions françaises
descriptions = []
properties = root.findall(".//property")

for prop in properties:
    desc_elem = prop.find("desc")
    if desc_elem is not None:
        fr_elem = desc_elem.find("fr")
        if fr_elem is not None and fr_elem.text:
            descriptions.append({
                "id": prop.findtext("id", "inconnu"),
                "description_fr": fr_elem.text
            })

# Sauvegarder en CSV
with open(FICHIER_CSV, 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(["id", "description_fr"])
    for desc in descriptions:
        writer.writerow([desc["id"], desc["description_fr"]])

print(f"✅ {len(descriptions)} descriptions extraites dans {FICHIER_CSV}")