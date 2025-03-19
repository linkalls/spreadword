FROM oven/bun:latest AS base

# Disabling Telemetry
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
WORKDIR /app

COPY package.json bun.lock ./
RUN rm -rf node_modules
RUN bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app

# 本番環境の.envファイルをコピー
COPY .env.production .env

# 依存関係のコピー
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV BUN_ENV=production

# 必要なディレクトリを作成
RUN mkdir -p /app/data /app/scripts 

RUN groupadd --system --gid 1001 bunapp
RUN useradd --system --uid 1001 --gid bunapp nextjs

# 初期化スクリプトとマイグレーションファイルをコピー
COPY drizzle.config.ts /app/

# 権限設定
# RUN chmod +x /app/scripts/init-db.sh
COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:bunapp .next

COPY --from=builder --chown=nextjs:bunapp /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bunapp /app/.next/static ./.next/static

# next.config.tsをコンテナにコピー
COPY --chown=nextjs:bunapp next.config.ts ./

# 依存関係のコピー
COPY --from=deps /app/node_modules ./node_modules


# ディレクトリの権限を設定
RUN chown -R nextjs:bunapp /app/data /app/scripts /app/src

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ボリュームの設定
# VOLUME ["/app/data"]

# 初期化スクリプトを実行してからサーバーを起動
# CMD ["/bin/bash", "-c", "/app/scripts/init-db.sh && bun server.js"]
CMD ["bun","server.js"]
