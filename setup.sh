#!/bin/bash

echo "🎂 Setting up The Den - Virtual Birthday Parties"
echo "=============================================="

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Initialize shadcn/ui
echo "🎨 Initializing shadcn/ui..."
npx shadcn@latest init --yes

# Add shadcn components
echo "🧩 Adding shadcn components..."
npx shadcn@latest add button input card dialog tabs avatar tooltip toast

# Check for environment file
if [ ! -f ".env.local" ]; then
    echo "⚠️  Environment file not found!"
    echo "📝 Please create .env.local with the following content:"
    echo ""
    echo "MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/the-den?retryWrites=true&w=majority"
    echo "NEXTAUTH_URL=http://localhost:3000"  
    echo "NEXTAUTH_SECRET=your-secret-key-here"
    echo ""
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "📖 For full setup instructions, see README.md"
echo ""
echo "🎉 Happy celebrating!"
