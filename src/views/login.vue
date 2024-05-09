<template>
  <div class="login">
    <div class="login-title">
      <img :src="logo" alt="WhaleHouse" class="logo" />
      <text class="title"> WhaleHouse </text>
    </div>

    <el-tabs v-model="activeName" class="login-type">
      <el-tab-pane label="DIRECT CH" name="direct">
        <div class="login-form">
          <el-input v-model="loginForm.connectionName" placeholder="Name" class="login-input">
            <template #prepend>
              <SvgIcon class="icon" name="svg-name" />
            </template>
          </el-input>
          <el-input
            v-model="loginForm.connectionUrl"
            placeholder="http://host:port"
            class="login-input"
          >
            <template #prepend>
              <SvgIcon class="icon" name="svg-address" />
            </template>
          </el-input>
          <el-input v-model="loginForm.username" placeholder="Login" class="login-input">
            <template #prepend>
              <SvgIcon class="icon" placeholder="Login" name="svg-username" />
            </template>
          </el-input>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="Password"
            class="login-input"
          >
            <template #prepend>
              <SvgIcon class="icon" name="svg-password" />
            </template>
          </el-input>
          <el-input
            v-model="loginForm.params"
            placeholder="key1=value&key2=value"
            class="login-input"
          >
            <template #prepend>
              <SvgIcon class="icon" name="svg-query" />
            </template>
          </el-input>
        </div>
      </el-tab-pane>

      <el-tab-pane label="DEMO" name="demo">
        <div class="login-form">
          <el-input
            :value="demoLoginForm.connectionName"
            :disabled="true"
            placeholder="Name"
            class="login-input"
          >
            <template #prepend>
              <SvgIcon class="icon" name="svg-name" />
            </template>
          </el-input>
          <el-input
            v-model="demoLoginForm.connectionUrl"
            :disabled="true"
            placeholder="http://host:port"
            class="login-input"
          >
            <template #prepend>
              <SvgIcon class="icon" name="svg-address" />
            </template>
          </el-input>
          <el-input
            v-model="demoLoginForm.username"
            :disabled="true"
            placeholder="Login"
            class="login-input"
          >
            <template #prepend>
              <SvgIcon class="icon" placeholder="Login" name="svg-username" />
            </template>
          </el-input>
          <el-input
            v-model="demoLoginForm.password"
            type="password"
            :disabled="true"
            placeholder="Password"
            class="login-input"
          >
            <template #prepend>
              <SvgIcon class="icon" name="svg-password" />
            </template>
          </el-input>
          <el-input
            v-model="demoLoginForm.params"
            :disabled="true"
            placeholder="key1=value&key2=value"
            class="login-input"
          >
            <template #prepend>
              <SvgIcon class="icon" name="svg-query" />
            </template>
          </el-input>
        </div>
      </el-tab-pane>
    </el-tabs>

    <el-button class="sign-btn" type="primary" @click="login"> SIGN IN </el-button>
  </div>
</template>
<script lang="ts" setup>
import SvgIcon from '@/components/SvgIcon/index.vue'
import logo from '@/assets/images/logo.svg'
import { ElNotification } from 'element-plus'
import { query } from '@/utils/http'
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useLoginStore } from '@/store'
import { useGoTo } from '@/layout/hooks'

const goTo = useGoTo()

const loginStore = useLoginStore()

const previousConnection = loginStore.previousConnection

const activeName = ref('direct') // direct | demo
const loginForm = reactive(
  previousConnection
    ? previousConnection
    : {
        connectionName: '',
        connectionUrl: '',
        username: '',
        password: '',
        params: '',
      },
)
const demoLoginForm = {
  connectionName: 'ck',
  connectionUrl: 'http://8.135.49.240:8123',
  username: 'default',
  password: '123456',
  params: '',
}

onMounted(() => {
  // @keyup.enter="login"
  document.addEventListener('keyup', keyupLogin)
})

onUnmounted(() => [document.removeEventListener('keyup', keyupLogin)])

const keyupLogin = (e: any) => {
  if (e.keyCode === 13) {
    login()
  }
}

const login = () => {
  const connection = activeName.value === 'direct' ? loginForm : demoLoginForm
  query(
    undefined,
    `&query=SELECT version() as version${loginForm.params ? `&${loginForm.params}` : ''}`,
    connection,
    true,
  )
    .then(() => {
      ElNotification.closeAll()
      loginStore.setConnection(connection)
      localStorage.setItem('connection', JSON.stringify({ connection }))
      goTo('Metrics')
    })
    .catch((err) => {
      console.error(err)
      ElNotification({
        title: 'Login',
        message: 'Login failed, please check your user name or password!',
        type: 'error',
      })
    })
}
</script>
<style lang="scss" scoped>
.login {
  width: 100%;
  height: 100%;
  background: url('../assets/images/login/bg.png') no-repeat;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .login-title {
    display: flex;
    align-items: center;
    .logo {
      margin-right: 20px;
    }
    .title {
      font-size: 40px;
      color: rgba(0, 0, 0, 0.85);
    }
  }
  .login-type {
    --el-border-color-light: #dbd4cc;
    width: 500px;
    margin-top: 85px;
    :deep(.el-tabs__active-bar) {
      height: 4px;
    }
  }
  .login-form {
    width: 500px;
    .login-input {
      --el-fill-color-light: transparent;
      --el-input-bg-color: #ffefd3;
      --el-border-color: #ffe6b5;
      --el-disabled-bg-color: transparent;
      height: 48px;
      line-height: 48px;
      border-radius: 4px;
      background: #ffefd3;
      margin-top: 20px;
      .el-input-group__prepend {
        box-shadow: none;
      }
      :deep(.el-input__wrapper) {
        box-shadow: none;
        padding: 1px 0;
      }
      .icon {
        width: 16px;
      }
    }
  }
  .sign-btn {
    --el-button-hover-border-color: var(--el-color-primary);
    --el-button-hover-bg-color: var(--el-color-primary);
    width: 500px;
    height: 48px;
    border-radius: 4px;
    margin-top: 60px;
    color: #4e5969;
  }
}
</style>
