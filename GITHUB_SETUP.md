# OHHO BURGERS — GitHub Deployment Setup

## To deploy this project to GitHub:

### Option 1: Using GitHub CLI
```bash
# Install gh CLI, then:
gh auth login
gh repo create ohho-burgers --public --source=. --push
```

### Option 2: Manual setup
1. Create a new repo on GitHub: https://github.com/new
   - Name: `ohho-burgers`
   - Public or Private (your choice)
   - Don't initialize with README (we have one)

2. Add the remote and push:
```bash
git remote add origin git@github.com:YOUR_USERNAME/ohho-burgers.git
# or use HTTPS:
git remote add origin https://github.com/YOUR_USERNAME/ohho-burgers.git

git branch -M main
git push -u origin main
```

### SSH Key (already generated)
Add this public key to GitHub → Settings → SSH and GPG keys → New SSH key:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIYM46fVHYiBgu60IRalbprM/Q51TkkpjOOyrf0aS5fD admin@ohhofoods.com
```
