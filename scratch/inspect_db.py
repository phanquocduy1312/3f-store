import os
import sys

try:
    import pymysql
    connection_class = pymysql.connect
except ImportError:
    try:
        import mysql.connector
        connection_class = mysql.connector.connect
    except ImportError:
        print("Neither pymysql nor mysql.connector is installed.")
        sys.exit(1)

conn = connection_class(
    host="127.0.0.1",
    user="3f_user",
    password="0932368720Ab",
    database="3f"
)

try:
    with conn.cursor() as cursor:
        # Find product
        cursor.execute("SELECT id, name, min_price, max_price FROM products WHERE slug LIKE '%s2pet-v2%' LIMIT 1")
        product = cursor.fetchone()
        if not product:
            print("Product S2pet V2 not found.")
            sys.exit(1)
        
        p_id, p_name, p_min, p_max = product
        print(f"Product ID: {p_id}")
        print(f"Product Name: {p_name}")
        print(f"Product Min Price: {p_min}")
        print(f"Product Max Price: {p_max}")
        
        # Find variants
        cursor.execute("SELECT id, sku, variant_name, price, original_price FROM product_variants WHERE product_id = %s", (p_id,))
        variants = cursor.fetchall()
        print("\nVariants:")
        for v in variants:
            v_id, v_sku, v_name, v_price, v_orig = v
            print(f"ID: {v_id} | SKU: {v_sku} | Name: {v_name} | Price: {v_price} | Original Price: {v_orig}")
finally:
    conn.close()
