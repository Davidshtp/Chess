"""
Script para popular la base de datos con datos iniciales de países, ciudades y más.
Ejecutar con: python seed_data.py
"""

from app.database import SessionLocal
from app.models.models import Pais, Ciudad, Organizador, Estado_Pago, Medio_Pago
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
            Pais(nombre_pais="CO"),  # Colombia
            Pais(nombre_pais="PE"),  # Perú
            Pais(nombre_pais="EC"),  # Ecuador
            Pais(nombre_pais="VE"),  # Venezuela
            Pais(nombre_pais="AR"),  # Argentina
            Pais(nombre_pais="CL"),  # Chile
            Pais(nombre_pais="BO"),  # Bolivia
            Pais(nombre_pais="PY"),  # Paraguay
            Pais(nombre_pais="UY"),  # Uruguay
            Pais(nombre_pais="BR"),  # Brasil
        ]
        db.add_all(paises)
        db.commit()
        print(f"✓ {len(paises)} países agregados")
        
        # Obtener Colombia (id 1)
        colombia = db.query(Pais).filter_by(nombre_pais="CO").first()
        
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
        peru = db.query(Pais).filter_by(nombre_pais="PE").first()
        ecuador = db.query(Pais).filter_by(nombre_pais="EC").first()
        argentina = db.query(Pais).filter_by(nombre_pais="AR").first()
        
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
        
        # Agregar organizadores
        print("👥 Sembrando organizadores...")
        bogota = db.query(Ciudad).filter_by(nombre_ciudad="Bogotá").first()
        medellin = db.query(Ciudad).filter_by(nombre_ciudad="Medellín").first()
        cali = db.query(Ciudad).filter_by(nombre_ciudad="Cali").first()
        
        organizadores = [
            Organizador(nombre_organizador="FECAJEDREZ", fk_ciudad_id=bogota.id_ciudad),
            Organizador(nombre_organizador="Club Ajedrez Bogotá", fk_ciudad_id=bogota.id_ciudad),
            Organizador(nombre_organizador="Club Ajedrez Medellín", fk_ciudad_id=medellin.id_ciudad),
            Organizador(nombre_organizador="Ajedrez Cali", fk_ciudad_id=cali.id_ciudad),
        ]
        db.add_all(organizadores)
        db.commit()
        print(f"✓ {len(organizadores)} organizadores agregados")
        
        # Agregar estados de pago
        print("💳 Sembrando estados de pago...")
        estados_pago = [
            Estado_Pago(estado_pago="Pendiente"),
            Estado_Pago(estado_pago="Pagado"),
            Estado_Pago(estado_pago="Cancelado"),
            Estado_Pago(estado_pago="Reembolso"),
        ]
        db.add_all(estados_pago)
        db.commit()
        print(f"✓ {len(estados_pago)} estados de pago agregados")
        
        # Agregar medios de pago
        print("💰 Sembrando medios de pago...")
        medios_pago = [
            Medio_Pago(nombre_medio="Efectivo"),
            Medio_Pago(nombre_medio="Tarjeta de Crédito"),
            Medio_Pago(nombre_medio="Tarjeta de Débito"),
            Medio_Pago(nombre_medio="Transferencia Bancaria"),
            Medio_Pago(nombre_medio="PayPal"),
            Medio_Pago(nombre_medio="Otro"),
        ]
        db.add_all(medios_pago)
        db.commit()
        print(f"✓ {len(medios_pago)} medios de pago agregados")
        
        print("\n✅ ¡Base de datos sembraded exitosamente!")
        print("\nResumen:")
        print(f"  - Países: {db.query(Pais).count()}")
        print(f"  - Ciudades: {db.query(Ciudad).count()}")
        print(f"  - Organizadores: {db.query(Organizador).count()}")
        print(f"  - Estados de Pago: {db.query(Estado_Pago).count()}")
        print(f"  - Medios de Pago: {db.query(Medio_Pago).count()}")
        
    except Exception as e:
        print(f"❌ Error al sembrar datos: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
