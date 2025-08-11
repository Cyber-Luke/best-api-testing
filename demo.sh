#!/bin/bash

# Demo: Wie man BEST in einem neuen Projekt verwendet

echo "🚀 BEST Framework Demo"
echo "====================="

echo ""
echo "❌ FALSCH (funktioniert nicht):"
echo "   best init my-project"
echo "   npx best init"
echo ""

echo "✅ RICHTIG:"
echo ""

echo "1. Installation in Ihr Projekt:"
echo "   npm install --save-dev github:Cyber-Luke/best-api-testing"
echo ""

echo "2. Setup ausführen:"
echo "   node ./node_modules/best/dist/setup-integration.js"
echo ""

echo "3. Oder manuell CLI verwenden:"
echo "   node ./node_modules/best/dist/cli.js --help"
echo "   node ./node_modules/best/dist/cli.js init my-project"
echo "   node ./node_modules/best/dist/cli.js run"
echo ""

echo "4. Mit npm scripts (nach Setup):"
echo "   npm run integration-tests:init"
echo "   npm run integration-tests:full"
echo ""

echo "📋 Grund für den Fehler:"
echo "   Wenn Sie BEST als --save-dev installieren, ist der 'best' Befehl"
echo "   nicht direkt verfügbar. Das ist normal bei Development-Dependencies."
echo ""

echo "💡 Lösung:"
echo "   Verwenden Sie immer den vollständigen Pfad oder npm scripts!"

echo ""
echo "🔗 Weitere Hilfe:"
echo "   - USER-INTEGRATION.md"
echo "   - USAGE.md"
echo "   - SETUP.md"
