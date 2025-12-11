"""
Script para popular la base de datos con datos iniciales de países, ciudades y más.
Ejecutar con: python seed_data.py
"""

from app.database import SessionLocal
from app.models.models import Pais, Ciudad, Organizador, Torneo
from datetime import datetime

def seed_database():
    db = SessionLocal()
    
    try:
        # Verificar si ya existen datos
        if db.query(Pais).first():
            print("✓ La base de datos ya contiene datos. Saltando seeding...")
            return
        
        print("🌍 Sembrando países...")
        paises = [
            Pais(nombre_pais="Colombia"),
            Pais(nombre_pais="Perú"),
            Pais(nombre_pais="Ecuador"),
            Pais(nombre_pais="Venezuela"),
            Pais(nombre_pais="Argentina"),
            Pais(nombre_pais="Chile"),
            Pais(nombre_pais="Bolivia"),
            Pais(nombre_pais="Paraguay"),
            Pais(nombre_pais="Uruguay"),
            Pais(nombre_pais="Brasil"),
        ]
        db.add_all(paises)
        db.commit()
        print(f"✓ {len(paises)} países agregados")
        
        # Obtener Colombia (id 1)
        colombia = db.query(Pais).filter_by(nombre_pais="Colombia").first()
        
        print("🏙️ Sembrando ciudades de Colombia...")
        ciudades_colombia = [
            Ciudad(nombre_ciudad="Bogotá", fk_pais_id=colombia.id_pais),
            Ciudad(nombre_ciudad="Medellín", fk_pais_id=colombia.id_pais),
            Ciudad(nombre_ciudad="Cali", fk_pais_id=colombia.id_pais),
            Ciudad(nombre_ciudad="Barranquilla", fk_pais_id=colombia.id_pais),
            Ciudad(nombre_ciudad="Cartagena", fk_pais_id=colombia.id_pais),
            Ciudad(nombre_ciudad="Santa Marta", fk_pais_id=colombia.id_pais),
            Ciudad(nombre_ciudad="Bucaramanga", fk_pais_id=colombia.id_pais),
            Ciudad(nombre_ciudad="Cúcuta", fk_pais_id=colombia.id_pais),
            Ciudad(nombre_ciudad="Manizales", fk_pais_id=colombia.id_pais),
            Ciudad(nombre_ciudad="Pereira", fk_pais_id=colombia.id_pais),
            Ciudad(nombre_ciudad="Ibagué", fk_pais_id=colombia.id_pais),
            Ciudad(nombre_ciudad="Armenia", fk_pais_id=colombia.id_pais),
        ]
        db.add_all(ciudades_colombia)
        db.commit()
        print(f"✓ {len(ciudades_colombia)} ciudades de Colombia agregadas")
        
        # Agregar ciudades para otros países (ejemplos)
        print("🏙️ Sembrando ciudades de otros países...")
        peru = db.query(Pais).filter_by(nombre_pais="Perú").first()
        ecuador = db.query(Pais).filter_by(nombre_pais="Ecuador").first()
        argentina = db.query(Pais).filter_by(nombre_pais="Argentina").first()
        
        otras_ciudades = [
            Ciudad(nombre_ciudad="Lima", fk_pais_id=peru.id_pais),
            Ciudad(nombre_ciudad="Arequipa", fk_pais_id=peru.id_pais),
            Ciudad(nombre_ciudad="Cusco", fk_pais_id=peru.id_pais),
            Ciudad(nombre_ciudad="Quito", fk_pais_id=ecuador.id_pais),
            Ciudad(nombre_ciudad="Guayaquil", fk_pais_id=ecuador.id_pais),
            Ciudad(nombre_ciudad="Buenos Aires", fk_pais_id=argentina.id_pais),
            Ciudad(nombre_ciudad="Córdoba", fk_pais_id=argentina.id_pais),
            Ciudad(nombre_ciudad="Rosario", fk_pais_id=argentina.id_pais),
        ]
        db.add_all(otras_ciudades)
        db.commit()
        print(f"✓ {len(otras_ciudades)} ciudades de otros países agregadas")
        
        # Agregar torneos
        print("🏆 Sembrando torneos...")
        torneos = [
            Torneo(nombre_torneo="Torneo Regional"),
            Torneo(nombre_torneo="Torneo Blitz"),
            Torneo(nombre_torneo="Torneo Juvenil"),
            Torneo(nombre_torneo="Torneo Rápido"),
            Torneo(nombre_torneo="Torneo Abierto"),
            Torneo(nombre_torneo="Torneo Internacional"),
        ]
        db.add_all(torneos)
        db.commit()
        print(f"✓ {len(torneos)} torneos agregados")
        
        print("\n✅ ¡Base de datos sembraded exitosamente!")
        print("\nResumen:")
        print(f"  - Países: {db.query(Pais).count()}")
        print(f"  - Ciudades: {db.query(Ciudad).count()}")
        print(f"  - Torneos: {db.query(Torneo).count()}")
        
    except Exception as e:
        print(f"❌ Error al sembrar datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
