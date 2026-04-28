#!/bin/bash
set -euo pipefail

trap 'echo "❌ Erreur pendant le déploiement de Nocte Syndikate."; exit 1' ERR

echo "⏬ Mise à jour du dépôt..."
git fetch origin
git reset --hard origin/master
git clean -fd

echo "🐳 Arrêt des anciens containers..."
docker compose down --remove-orphans

echo "🔨 Rebuild + lancement..."
docker compose up -d --build

echo "🧪 Vérification..."
docker ps

cat << 'EOF'

███╗   ██╗ ██████╗  ██████╗████████╗███████╗
████╗  ██║██╔═══██╗██╔════╝╚══██╔══╝██╔════╝
██╔██╗ ██║██║   ██║██║        ██║   █████╗
██║╚██╗██║██║   ██║██║        ██║   ██╔══╝
██║ ╚████║╚██████╔╝╚██████╗   ██║   ███████╗
╚═╝  ╚═══╝ ╚═════╝  ╚═════╝   ╚═╝   ╚══════╝

   ███████╗██╗   ██╗███╗   ██╗██████╗ ██╗██╗  ██╗ █████╗ ████████╗███████╗
   ██╔════╝╚██╗ ██╔╝████╗  ██║██╔══██╗██║██║ ██╔╝██╔══██╗╚══██╔══╝██╔════╝
   ███████╗ ╚████╔╝ ██╔██╗ ██║██║  ██║██║█████╔╝ ███████║   ██║   █████╗
   ╚════██║  ╚██╔╝  ██║╚██╗██║██║  ██║██║██╔═██╗ ██╔══██║   ██║   ██╔══╝
   ███████║   ██║   ██║ ╚████║██████╔╝██║██║  ██╗██║  ██║   ██║   ███████╗
   ╚══════╝   ╚═╝   ╚═╝  ╚═══╝╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝

EOF

echo "✅ Déploiement Nocte Syndikate terminé."