"use client"
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* パンくずリスト */}
      <nav className="text-sm mb-8">
        <ol className="list-none p-0 flex items-center space-x-2">
          <li>
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              ホーム
            </Link>
          </li>
          <li className="text-gray-500">/</li>
          <li className="text-gray-700">利用規約</li>
        </ol>
      </nav>

      <h1 className="text-3xl font-bold mb-8 text-center">利用規約</h1>

      <div className="max-w-3xl mx-auto space-y-8 text-gray-700">
        {/* サービス概要 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">1. サービス概要</h2>
          <div className="space-y-4">
            <p>
              本利用規約（以下「本規約」）は、SpreadWord（以下「当サービス」）の利用条件を定めるものです。
              ユーザーの皆様（以下「ユーザー」）には、本規約に従って当サービスをご利用いただきます。
            </p>
            <p>
              当サービスは、英単語学習を支援するプラットフォームであり、以下の機能を提供します：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>単語リストの作成・共有機能</li>
              <li>クイズ・フラッシュカード機能</li>
              <li>学習進捗の管理・分析</li>
              <li>コミュニティ機能（スタディグループ等）</li>
            </ul>
          </div>
        </section>

        {/* アカウント */}
        <section>
          <h2 className="text-xl font-semibold mb-4">2. アカウント</h2>
          <div className="space-y-4">
            <p>
              当サービスの利用にはアカウントの作成が必要です。
              アカウント作成時には、以下の事項に同意していただく必要があります：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>正確な情報を提供すること</li>
              <li>アカウント情報の管理責任を負うこと</li>
              <li>不正アクセスを発見した場合、直ちに報告すること</li>
            </ul>
            <p>
              当サービスは、以下の場合にアカウントを停止または削除する権利を有します：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>本規約に違反した場合</li>
              <li>不正なアクセスや使用が確認された場合</li>
              <li>その他、当サービスの運営に支障をきたす行為が確認された場合</li>
            </ul>
          </div>
        </section>

        {/* コンテンツと知的財産権 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">3. コンテンツと知的財産権</h2>
          <div className="space-y-4">
            <p>
              当サービスに投稿されたコンテンツ（単語リスト、メモ等）に関して：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                ユーザーが作成したコンテンツの著作権はユーザーに帰属します
              </li>
              <li>
                ただし、当サービスにコンテンツを投稿することで、当サービスに対して当該コンテンツを利用、複製、配信する権利を許諾したものとします
              </li>
              <li>
                公開設定で共有された単語リストは、他のユーザーが学習目的で利用することができます
              </li>
            </ul>
            <p>
              当サービスのプラットフォーム自体に関する知的財産権は、全て当サービスに帰属します。
            </p>
          </div>
        </section>

        {/* 禁止事項 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">4. 禁止事項</h2>
          <div className="space-y-4">
            <p>以下の行為を禁止します：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>法令違反または犯罪に関連する行為</li>
              <li>
                当サービスのシステムやネットワークに損害を与える行為
              </li>
              <li>他のユーザーに対する嫌がらせや迷惑行為</li>
              <li>不適切なコンテンツの投稿や共有</li>
              <li>当サービスの運営を妨害する行為</li>
              <li>
                その他、当サービスが不適切と判断する行為
              </li>
            </ul>
          </div>
        </section>

        {/* 免責事項 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">5. 免責事項</h2>
          <div className="space-y-4">
            <p>
              当サービスは以下の事項について、一切の責任を負いません：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                ユーザー間のトラブルや紛争
              </li>
              <li>
                当サービスの利用による学習効果や成果
              </li>
              <li>
                システムの障害や中断によるデータの損失
              </li>
              <li>
                その他、当サービスの利用に関連して生じた損害
              </li>
            </ul>
          </div>
        </section>

        {/* 規約の変更 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">6. 規約の変更</h2>
          <div className="space-y-4">
            <p>
              当サービスは、必要に応じて本規約を変更することができます。
              変更後の規約は、当サービス上での告知により効力を生じるものとします。
              ユーザーは定期的に規約を確認する責任を負うものとします。
            </p>
          </div>
        </section>

        {/* 準拠法 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">7. 準拠法</h2>
          <div className="space-y-4">
            <p>
              本規約の解釈は日本法に従って解釈されるものとする。
            </p>
          </div>
        </section>
        <p className="text-sm text-gray-500 mt-8">
          最終更新日：2025年3月18日
        </p>
      </div>
    </div>
  );
}
