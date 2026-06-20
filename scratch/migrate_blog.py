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

print("Connecting to database...")
conn = connection_class(
    host="127.0.0.1",
    user="3f_user",
    password="0932368720Ab",
    database="3f"
)

try:
    with conn.cursor() as cursor:
        print("Creating table blog_posts if not exists...")
        sql = """
        CREATE TABLE IF NOT EXISTS blog_posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            summary TEXT NULL,
            content LONGTEXT NOT NULL,
            thumbnail_url VARCHAR(500) NULL,
            author VARCHAR(100) DEFAULT 'Admin',
            published_at DATETIME NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP NULL,
            INDEX idx_slug (slug),
            INDEX idx_published_at (published_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
        cursor.execute(sql)
        conn.commit()
        print("Table blog_posts created successfully!")
except Exception as e:
    print(f"Error executing migration: {e}")
finally:
    conn.close()
