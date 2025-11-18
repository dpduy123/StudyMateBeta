#!/bin/bash

echo "🎨 Setting up PlantUML export tools..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Please install it first:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

echo "✅ Homebrew found"

# Install GraphViz (required for PlantUML)
echo ""
echo "📦 Installing GraphViz..."
if brew list graphviz &>/dev/null; then
    echo "✅ GraphViz already installed"
else
    brew install graphviz
    echo "✅ GraphViz installed successfully"
fi

# Install PlantUML
echo ""
echo "📦 Installing PlantUML..."
if brew list plantuml &>/dev/null; then
    echo "✅ PlantUML already installed"
else
    brew install plantuml
    echo "✅ PlantUML installed successfully"
fi

# Verify installations
echo ""
echo "🔍 Verifying installations..."
echo ""
echo "GraphViz version:"
dot -V
echo ""
echo "PlantUML version:"
plantuml -version | head -1

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Export diagrams: npm run diagrams:export"
echo "   2. Or use: plantuml -tsvg docs/*.puml"
echo "   3. Or install VS Code extension: 'PlantUML' by jebbs"
