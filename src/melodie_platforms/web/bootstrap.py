from .auth import bootstrap

if __name__ == "__main__":
    bootstrap()
    print("Administrator created. Remove MMD_ADMIN_PASSWORD from the process environment.")
