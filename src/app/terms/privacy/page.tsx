"use client"

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">プライバシーポリシー</h1>

      <div className="max-w-3xl mx-auto space-y-8 text-gray-700">
        {/* はじめに */}
        <section>
          <h2 className="text-xl font-semibold mb-4">1. はじめに</h2>
          <div className="space-y-4">
            <p>
              SpreadWord（以下「当サービス」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。
              本プライバシーポリシーでは、当サービスにおける個人情報の収集・利用・保護について説明します。
            </p>
          </div>
        </section>

        {/* 収集する情報 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">2. 収集する情報</h2>
          <div className="space-y-4">
            <p>当サービスは、以下の情報を収集します：</p>
            <h3 className="font-semibold mt-4">2.1 アカウント情報</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>名前</li>
              <li>メールアドレス</li>
              <li>プロフィール画像（任意）</li>
              <li>OAuth認証情報（外部サービスでログインの場合）</li>
            </ul>

            <h3 className="font-semibold mt-4">2.2 学習データ</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>学習進捗状況</li>
              <li>クイズの回答履歴</li>
              <li>作成した単語リスト</li>
              <li>学習メモ</li>
            </ul>

            <h3 className="font-semibold mt-4">2.3 利用データ</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>アクセスログ</li>
              <li>利用端末情報</li>
              <li>IPアドレス</li>
              <li>Cookie情報</li>
            </ul>
          </div>
        </section>

        {/* 情報の利用目的 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">3. 情報の利用目的</h2>
          <div className="space-y-4">
            <p>収集した情報は、以下の目的で利用します：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>サービスの提供・運営</li>
              <li>学習進捗の管理・分析</li>
              <li>ユーザー体験の向上</li>
              <li>新機能の開発・改善</li>
              <li>お知らせやサポートの提供</li>
              <li>不正利用の防止</li>
            </ul>
          </div>
        </section>

        {/* 情報の共有・開示 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">4. 情報の共有・開示</h2>
          <div className="space-y-4">
            <p>
              当サービスは、以下の場合を除き、ユーザーの同意なく第三者に個人情報を提供することはありません：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>法令に基づく場合</li>
              <li>人の生命・身体・財産の保護のために必要な場合</li>
              <li>公衆衛生の向上・児童の健全な育成のために必要な場合</li>
              <li>国の機関等の法令の定める事務の遂行に協力する場合</li>
            </ul>
          </div>
        </section>

        {/* Cookieの使用 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">5. Cookieの使用</h2>
          <div className="space-y-4">
            <p>
              当サービスでは、ユーザー体験の向上やサービスの改善のためにCookieを使用します。
              Cookieは以下の目的で使用されます：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>ログイン状態の維持</li>
              <li>利用状況の分析</li>
              <li>サービスの最適化</li>
            </ul>
            <p>
              ブラウザの設定でCookieを無効にすることも可能ですが、その場合一部の機能が利用できなくなる可能性があります。
            </p>
          </div>
        </section>

        {/* データの保護 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">6. データの保護</h2>
          <div className="space-y-4">
            <p>
              当サービスは、収集した情報の保護のために以下の対策を実施しています：
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>SSL通信の使用</li>
              <li>アクセス制限の実施</li>             
            </ul>
          </div>
        </section>

        {/* ユーザーの権利 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">7. ユーザーの権利</h2>
          <div className="space-y-4">
            <p>ユーザーには以下の権利があります：</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>個人情報の開示請求</li>
              <li>個人情報の訂正・削除請求</li>
              <li>個人情報の利用停止請求</li>
            </ul>
            <p>
              これらの権利行使を希望する場合は、お問い合わせフォームよりご連絡ください。
            </p>
          </div>
        </section>

        {/* ポリシーの変更 */}
        <section>
          <h2 className="text-xl font-semibold mb-4">8. ポリシーの変更</h2>
          <div className="space-y-4">
            <p>
              本プライバシーポリシーは、必要に応じて変更されることがあります。
              重要な変更がある場合は、サービス上で通知します。
            </p>
          </div>
        </section>

        {/* お問い合わせ */}
        <section>
          <h2 className="text-xl font-semibold mb-4">9. お問い合わせ</h2>
          <div className="space-y-4">
            <p>
              プライバシーポリシーに関するお問い合わせは、お問い合わせフォームよりご連絡ください。
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
