# #!/bin/bash
# set -e

# echo "Waiting for libsql to be ready..."
# # libsqlサーバーが準備できるまで待機
# for i in {1..30}; do
#   if curl -s http://libsql:8080/health > /dev/null; then
#     break
#   fi
#   echo "Waiting for libsql server... ($i/30)"
#   sleep 1
# done

# if [ $i -eq 30 ]; then
#   echo "Error: libsql server did not become ready in time"
#   exit 1
# fi

# echo "Libsql server is ready"

# # マイグレーションの実行
# echo "Running database migrations..."
# if ! bun run db:migrate; then
#     echo "Error: Database migration failed"
#     exit 1
# fi
# echo "Database migrations completed successfully"

# # 初期データの投入（必要な場合）
# if [ -f "/app/src/db/seed.ts" ]; then
#     echo "Running seed data..."
#     if ! bun run src/db/seed.ts; then
#         echo "Error: Seed data import failed"
#         exit 1
#     fi
#     echo "Seed data import completed successfully"
# fi

# echo "Database initialization completed"
