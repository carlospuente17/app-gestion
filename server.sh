#!/bin/bash
# Script para ejecutar servidor local en Mac/Linux
# Requiere Python 3 instalado

echo ""
echo "  ============================================"
echo "  Servidor Local - Gestor de Tareas"
echo "  ============================================"
echo ""

# Verifica si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 no está instalado"
    echo "Instálalo con: brew install python3"
    exit 1
fi

echo "[INFO] Iniciando servidor local..."
echo ""
echo "  Abre en tu navegador:"
echo "  --> http://localhost:8000"
echo ""
echo "  Para detener: Presiona Ctrl+C"
echo ""
echo "  ============================================"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8000 --directory .
