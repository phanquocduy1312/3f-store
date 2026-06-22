import os
import sys
import fnmatch
from ftplib import FTP, error_perm

def load_deploy_env():
    """Reads .deploy.env from the root directory if it exists."""
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.deploy.env')
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, val = line.split('=', 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    if key not in os.environ:
                        os.environ[key] = val

def get_env_or_default(key, default=None):
    return os.environ.get(key, default)

def should_ignore(rel_path):
    """Checks if a relative file path should be ignored according to specifications."""
    normalized = rel_path.replace('\\', '/')
    
    # List of ignore pattern globs
    ignore_patterns = [
        '.env',
        'storage/uploads/*',
        'storage/logs/*',
        '.git/*',
        '.github/*',
        'node_modules/*',
        'vendor/*',
        '__pycache__/*',
        '*.DS_Store'
    ]
    
    parts = normalized.split('/')
    for part in parts:
        if part in ['.git', '.github', 'node_modules', 'vendor', '__pycache__', '.DS_Store']:
            return True
            
    for pattern in ignore_patterns:
        if fnmatch.fnmatch(normalized, pattern) or fnmatch.fnmatch(normalized, f"*/{pattern}"):
            return True
            
    if normalized.startswith('storage/uploads/') or normalized.startswith('storage/logs/'):
        return True
        
    return False

def ensure_remote_dir(ftp, remote_dir):
    """Recursively creates remote directories if they do not exist."""
    parts = [p for p in remote_dir.split('/') if p]
    current = ""
    if remote_dir.startswith('/'):
        current = "/"
    
    for part in parts:
        current = f"{current}/{part}".replace('//', '/')
        try:
            ftp.cwd(current)
        except error_perm:
            try:
                ftp.mkd(current)
                print(f"[DIR] Created: {current}")
            except Exception as e:
                print(f"[ERROR] Failed to create directory {current}: {e}")
                raise

def deploy():
    load_deploy_env()
    
    ftp_host = get_env_or_default('FTP_HOST', '203.205.31.252')
    ftp_user = get_env_or_default('FTP_USER')
    ftp_pass = get_env_or_default('FTP_PASS')
    ftp_target_dir = get_env_or_default('FTP_TARGET_DIR', '/httpdocs')
    
    if not ftp_user or not ftp_pass:
        print("[ERROR] FTP_USER and FTP_PASS must be provided in environment variables or .deploy.env")
        sys.exit(1)
        
    project_root = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    local_source = os.path.join(project_root, '3f-api')
    if not os.path.exists(local_source):
        print(f"[ERROR] Local source folder '{local_source}' does not exist.")
        sys.exit(1)
        
    print(f"Connected FTP host: {ftp_host}")
    try:
        ftp = FTP(ftp_host)
        ftp.login(ftp_user, ftp_pass)
        print("Logged in successfully.")
    except Exception as e:
        print(f"[ERROR] Failed to login: {e}")
        sys.exit(1)
        
    print(f"Local source: {local_source}")
    print(f"Remote target: {ftp_target_dir}")
    
    try:
        ftp.cwd(ftp_target_dir)
    except error_perm:
        try:
            ftp.mkd(ftp_target_dir)
            print(f"Created remote target dir: {ftp_target_dir}")
        except Exception as e:
            print(f"[ERROR] Target directory {ftp_target_dir} not found and cannot be created: {e}")
            ftp.quit()
            sys.exit(1)
            
    uploaded_count = 0
    skipped_count = 0

    def upload_file(local_file_path, rel_path):
        nonlocal uploaded_count, skipped_count

        if should_ignore(rel_path):
            print(f"[SKIP] {rel_path}")
            skipped_count += 1
            return

        remote_file_path = f"{ftp_target_dir}/{rel_path}".replace('//', '/').replace('\\', '/')
        remote_dir = os.path.dirname(remote_file_path)

        local_size = os.path.getsize(local_file_path)
        needs_upload = True

        try:
            remote_size = ftp.size(remote_file_path)
            if remote_size == local_size:
                needs_upload = False
        except Exception:
            pass

        if not needs_upload:
            print(f"[SKIP (Unchanged)] {rel_path}")
            skipped_count += 1
            return

        try:
            ensure_remote_dir(ftp, remote_dir)
        except Exception:
            print(f"[ERROR] Skipping {rel_path} due to directory creation failure.")
            return

        print(f"[UPLOAD] {rel_path} -> {remote_file_path} ({local_size} bytes)")
        try:
            with open(local_file_path, 'rb') as f:
                ftp.storbinary(f"STOR {remote_file_path}", f)
            uploaded_count += 1
        except Exception as e:
            print(f"[ERROR] Failed to upload {rel_path}: {e}")
    
    for root, dirs, files in os.walk(local_source):
        for file in files:
            local_file_path = os.path.join(root, file)
            rel_path = os.path.relpath(local_file_path, local_source)
            upload_file(local_file_path, rel_path)

    seed_file = os.path.join(project_root, 'data', 'products.json')
    if os.path.exists(seed_file):
        upload_file(seed_file, 'data/products.json')

    diamond_badge_file = os.path.join(project_root, 'public', 'assets', 'images', 'badge_diamond.png')
    if os.path.exists(diamond_badge_file):
        upload_file(diamond_badge_file, 'public/assets/images/badge_diamond.png')

    ftp.quit()
    print("Deploy completed.")
    print(f"Summary: Uploaded {uploaded_count} files, Skipped {skipped_count} files.")

if __name__ == '__main__':
    deploy()
