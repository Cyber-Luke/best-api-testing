#!/bin/bash

# Demo: Wie man BEST in einem neuen Projekt verwendet

echo "🚀 BEST Framework Demo"
echo "====================="

echo ""
echo "❌ VORHER (funktionierte nicht):"
echo "   best init my-project"
echo "   npx best init"
echo ""

echo "✅ JETZT FUNKTIONIERT (nach dem Fix):"
echo ""

echo "1. Installation in Ihr Projekt:"
echo "   npm install --save-dev github:Cyber-Luke/best-api-testing"
echo ""

echo "2a. Setup ausführen:"
echo "   npx best-setup"
echo ""

echo "2b. Oder CLI verwenden:"
echo "   npx best init my-project"
echo "   npx best run"
echo ""

echo "3. Manuelle Verwendung (funktioniert immer):"
echo "   node ./node_modules/best/dist/cli.js --help"
echo "   node ./node_modules/best/dist/cli.js init my-project"
echo "   node ./node_modules/best/dist/cli.js run"
echo ""

echo "4. Mit npm scripts (nach Setup):"
echo "   npm run integration-tests:init"
echo "   npm run integration-tests:full"
echo ""

echo "� Was wurde gefixt:"
echo "   - dist/ Ordner ist jetzt in GitHub committed"
echo "   - Binaries werden in node_modules/.bin/ installiert"
echo "   - npx best und best Commands funktionieren jetzt!"
echo ""

echo "💡 Warum es vorher nicht funktionierte:"
echo "   - dist/ war in .gitignore -> npm konnte keine Binaries finden"
echo "   - Bei GitHub-Installation wird nicht automatisch gebaut"
echo "   - Jetzt sind die kompilierten Dateien direkt verfügbar"

echo ""
echo "🔗 Weitere Hilfe:"
echo "   - USER-INTEGRATION.md"
echo "   - USAGE.md"
echo "   - SETUP.md"
