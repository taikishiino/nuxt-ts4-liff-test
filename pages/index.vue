<template>
  <div class="container">
    <div>
      <Logo />
      <h1 class="title">nuxt3-ts4-sample</h1>
      <div class="links">
        <a
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
          rel="noopener noreferrer"
          class="button--grey"
        >
          GitHub {{user}}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/functions'
import liff from '@line/liff';

const liffId = 'YOUR_LIFF_ID'
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
}

firebase.initializeApp(firebaseConfig)

const auth = firebase.auth
const functions = firebase.app().functions('asia-northeast1')

export default Vue.extend({
  data() {
    return {
      user: null as firebase.User | null
    }
  },
  async created() {
    // 1. LIFFの初期化
    // https://developers.line.biz/ja/docs/liff/developing-liff-apps/#liff%E3%82%A2%E3%83%95%E3%82%9A%E3%83%AA%E3%82%92%E9%96%8B%E7%99%BA%E3%81%99%E3%82%8B
    const liffId = '1655263579-K9gGjjy6'
    await liff.init({liffId})
      .catch((err) => {
        window.alert('LIFFの初期化失敗。\n' + err)
      })
    // 2. LINEに未認証の場合、ログイン画面にリダイレクト
    if (!liff.isLoggedIn()) {
      await liff.login()
      return
    }
    // 3. firebaseの認証情報を取得
    auth().onAuthStateChanged(async user => {
      console.warn("onAuthStateChanged: ", user);
      if (user) {
        // 3.1 firebaseにログイン済みの場合、ユーザー情報を取得し、終了
        this.user = user
      } else {
        // 3.2 firebaseにログインしていない場合
        // 3.2.1 LIFF APIを利用して、LINEのアクセストークンを取得
        const accessToken = liff.getAccessToken()
        console.warn("accessToken: ", accessToken);
        // 3.2.3 LINEのIDトークンをfirebase functionsに投げて、firebaseのカスタム認証用トークンを取得
        const login = functions.httpsCallable('login')
        const result = await login({accessToken})
        if (result.data.error) {
          console.error(result.data.error)
        } else {
          // 3.2.4 firebaseの認証用トークンを利用してカスタム認証
          const res = await auth().signInWithCustomToken(result.data.token)
          this.user = res.user
        }
      }
    })
  },
})
</script>

<style>
/* Sample `apply` at-rules with Tailwind CSS
.container {
@apply min-h-screen flex justify-center items-center text-center mx-auto;
}
*/
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
