@echo off
echo 🎂 Setting up The Den - Virtual Birthday Parties
echo ==============================================

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Initialize shadcn/ui
echo 🎨 Initializing shadcn/ui...
call npx shadcn@latest init --yes

REM Add shadcn components
echo 🧩 Adding shadcn components...
call npx shadcn@latest add button input card dialog tabs avatar tooltip toast

REM Check for environment file
if not exist ".env.local" (
    echo ⚠️  Environment file not found!
    echo 📝 Please create .env.local with the following content:
    echo.
    echo MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/the-den?retryWrites=true^&w=majority
    echo NEXTAUTH_URL=http://localhost:3000
    echo NEXTAUTH_SECRET=your-secret-key-here
    echo.
)

echo ✅ Setup complete!
echo.
echo 🚀 To start the development server:
echo    npm run dev
echo.
echo 📖 For full setup instructions, see README.md
echo.
echo 🎉 Happy celebrating!
pause
