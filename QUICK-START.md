# Fuel Bill Generator - Quick Start Guide

## 🚀 Easy Start (One Click!)

### **Method 1: Double-Click Start Script**
1. Navigate to the project folder: `/Users/manas/Vibe Coding/Fuel App/`
2. Double-click on **`start-server.sh`**
3. The server will start automatically and open your browser!

### **Method 2: Right-Click Start**
1. Right-click on **`start-server.sh`**
2. Select **"Open With" → "Terminal"**
3. Server starts and browser opens automatically!

### **Method 3: Terminal Command**
```bash
cd "/Users/manas/Vibe Coding/Fuel App"
./start-server.sh
```

## 🛑 How to Stop the Server

Press **`Ctrl + C`** in the terminal window

## 📝 What the Script Does

1. ✅ Navigates to the project directory
2. ✅ Checks if dependencies are installed (installs if needed)
3. ✅ Starts the server on `http://localhost:3000`
4. ✅ Automatically opens your browser
5. ✅ Shows you the server status

## 🌐 Access the Application

Once started, the application will be available at:
**http://localhost:3000**

## 💡 Tips

- **Keep the terminal window open** while using the application
- **Don't close the terminal** - this will stop the server
- **Minimize the terminal** if you don't want to see it
- The browser will open automatically after 3 seconds

## 🔧 Troubleshooting

**If the script doesn't run:**
```bash
# Make it executable
chmod +x start-server.sh
```

**If port 3000 is already in use:**
- Stop any other servers running on port 3000
- Or edit `.env` file to change the port

## 📁 File Locations

- **Generated Bills:** `/Users/manas/Vibe Coding/Fuel App/downloads/`
- **Start Script:** `/Users/manas/Vibe Coding/Fuel App/start-server.sh`
- **Project Folder:** `/Users/manas/Vibe Coding/Fuel App/`

---

**That's it! Now you can start the Fuel Bill Generator with just one click!** 🎉
