#!/bin/bash

echo "📊 Exporting PlantUML diagrams for StudyMate..."
echo ""

# Check if plantuml is installed
if ! command -v plantuml &> /dev/null; then
    echo "❌ PlantUML not found!"
    echo ""
    echo "Please run: ./scripts/setup-plantuml.sh"
    echo "Or install manually: brew install plantuml graphviz"
    exit 1
fi

# Create output directory
mkdir -p docs/exported

# Count total files
total_files=$(ls -1 docs/*.puml 2>/dev/null | wc -l)
if [ "$total_files" -eq 0 ]; then
    echo "❌ No .puml files found in docs/"
    exit 1
fi

echo "Found $total_files diagram(s) to export"
echo ""

# Export to PNG
echo "🖼️  Exporting to PNG..."
plantuml -tpng -o exported docs/*.puml
png_success=$?

# Export to SVG
echo "🎨 Exporting to SVG..."
plantuml -tsvg -o exported docs/*.puml
svg_success=$?

echo ""
if [ $png_success -eq 0 ] && [ $svg_success -eq 0 ]; then
    echo "✅ Export completed successfully!"
else
    echo "⚠️  Some exports may have failed. Check output above."
fi

echo ""
echo "📁 Output location: docs/exported/"
echo ""
echo "Files exported:"
ls -lh docs/exported/ | grep -E '\.(png|svg)$' | awk '{print "   " $9 " (" $5 ")"}'

echo ""
echo "📝 Total files:"
echo "   PNG: $(ls -1 docs/exported/*.png 2>/dev/null | wc -l | tr -d ' ')"
echo "   SVG: $(ls -1 docs/exported/*.svg 2>/dev/null | wc -l | tr -d ' ')"
