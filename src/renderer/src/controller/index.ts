import { setup, createActor } from 'xstate';
import { Router, createRouter, createWebHashHistory } from 'vue-router';
import routes from "./routes";
import { login, signUp } from "./auth";
import db from '@/db';
import { useUserStore } from '@/store/user';
import { toUserWebSave } from '@/utils/user';
import { useAppStore } from '@/store/appdata';
import { addAsyncProcess, addSyncProcess, nowRouterState, readQuery, routerMap, runPluginLfe } from './helper';
import { toNumber } from 'lodash-es';
export const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
})

const appMachine = setup({
  types: {} as {
    events:
    { type: 'addUser' | 'addTempUser', user: User.WebDbSave } |
    { type: 'removeUser', user: User.WebDbSave } |
    { type: 'quit', to: 'goSetting' | 'goPlugin' | 'goHome' | 'goQuitApp' | 'goAddress' | 'goDev' } |
    { type: 'quit', to: 'goChat', params: { dev: false, uid: number, type: string } | { dev: true } } |
    { type: 'goSetting' | 'goPlugin' | 'goChat' | 'goHome' | 'goQuitApp' | 'goAddress' | 'goDev' | 'loadPlugin' | 'loadCSS' } |
    { type: 'receive' | 'sendButtonClick', msg: Peer.Msg.All } |
    { type: 'logining', data: User.Arg.login } |
    { type: 'singuping', data: User.Arg.sigeup } |
    { type: 'changingSetting', data: State.SettingChange } |
    { type: 'selOther' | 'sel', data: AppPlugin.PluginPage } |
    { type: 'downLoad' | 'remove', data: AppPlugin.PluginInfo },
    context: {
      router: Router,
      data_goChat: { dev: false, uid: number, type: string } | { dev: true }
    }
  }
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMAOqB0B7AdgZTABcBXVAYgBstkIAFC4qASxwG0AGAXUVFS1iaEmuHiAAeiAEzt2GAJwBmAOwBWdkvYA2OQA4FAFh0qANCACeiAIzt9GdnM065MnZNftLlgL5fTaTLj0jCwAMtQQlOEAwnh4HNxIIHwCQiKJEgj6cioYWQqaCgqSmh4qOvqmFgjWmnYO2SrZlkoGRT5+6Ng4YTQxeGQCOFCkLFDxosmCwjiiGaq1xZJKLR769kpylVY2GI3aJSqNNiqWcu0g-l09EH2RzDij44mTqTPpiEoFGJ6WksWazWU5S2CGktQMSl+RWcyjklgU50uuDC9zIT14-CmaVAGWs+lq1k8Kn0kgUcjk+ksIOkSgw5SUpO0nlUhR0iM6uDwTCgOAAquR0UlMa9Ztt8d8PJZiaTyZSQTU6tpDk0Wvo2r4LhycABBYiEAAWkDRXAmwumouqlh0skkzgaVpUqn0JnMiAUzVyTnxOk0AMd7Ek7ICOAAElgALZgABKWD1YAATmQAI7EQSCl7m97VSTEjD5RoM+F6SyaEHE2x6OEqBT2R0+pRBrpRfXIQgxuOJlNpk3PM3Y8Rux3ydiOgHqHPsHQ6EGuWojoyk23VyT6Ru4Zut9uEBNdAg4CCjACycFgyBgxoSGJSmZxbuKdgUjsO1esnwK8pLOgwf00kLVymrBENSRHANzbWNt3jLoABVkAoABrMh4zAABjMAmAANzAdM+zeW9QWUDBNFHANrVJBQ9EkD9rG-aRKRraQykpNdQJbcCOxguDENgMB9wAIT1Qh1woJgUPgnDr37DJSVpYjPlIgNWSKeVJClPNJxHVSxzhVdgK1MCtx3XBj1gU9zwkrE8IHBAijnR9VEOd11F9BR5S0BRvjJSw1UhP4SRYoJ7kMztU0ICyRSzeFpHkQwlCnGtfQZCpXQQHQaJ0OLfiJEoKV0jpg0Clhgq6KMwHDLAsMKnAL1NSSrNxfRVHU7Jf0OP54VLFLPG0PNshXFQ5N0TQAoYIKIKM-B9SwAB3KrtQAIwgsgIBm7pwnCm9rO8pRbChAEpUaspmg-ew6RkX88WJbaRuCHBis5KbZtGlgFqWniKAAeQNBMNqkqwSxyEcrWtX4c1JNyNF65Z8mOW0zj0grnru8aoIema5sWvUkLKirsJ7K9LItbbdsZIlDrSpQVO8ukpxLEcDGKFQbrGjjOTAChUMIKqat7OqiYBuwTinDw-hUcGut+WRGucU49CKUXmaKlGugAEVwaaqBobnfvqqwTlpOK4fdVqAbczRJAwSEKQ8FoNAZJmEa6Kr7rWrWkePHBiAGdmdYtOFZGrAEMoGn1ClcrrJw8naBvN3R2CKbxHbZwghCGYLk1C32s2kNT1GUSExcpHbpxStLZAytKyndR1GobJP8CIVOoBdggU9GDchjAMgUJbIZRlbpus-w053TpZY1V9FcnGItzq1yLyGV8sW9BY7UIAgZDTPTrswvxoU+ezwocg2ZwjGWc3H06qoy7Hyvixr5ZV-XzfYBd64143k8Pa9mgIF5Hj4xD2siuEkREbAOHjnIDQ5Qr7-SKHYUkJwChFEfE-T+W9lbInCB-F+38yC-2gmVVA-8fp7wzH9UEJILZkhzGSNY5J1Czw8mqOQE5VJGCKHlTUwYcEnjftg5+X9eJe2QuVLCJDAFkNwhaFcto8z6DWKpaGLQXRVCyrIDYBhvI5hUTYNBL8XYfwkTzAmEV8JLCnN+GwtojCOmhMlNR8IPJiwMKwxwnwVz6L4ZgnU69CHhmIQAkx+9CbZzil+OiNjDgtHDmokcthFCsLKAyR88SvEYNZndHG4iglAOkuEqxJJdDRPsVTC2toDDEjhNIP4QF8oYHjCjMgUAsBgTyR8aKqkKQVLoicEEv4PKPkaKDDY1Y1SNkaR2ZpWAqrtOzFob8Po-j020HkGc6VMpVylDtR+jtJmQWmQPR4UiD7D0OF+QopxijNEys6fpLQ8zKhGdkVoEymktN4aZOZVoyRjw0IoTQtcMpURSgMx5wy-ijNeXs95WAACKoVtToDmRAuwywklaGKFoMsbhch4jcNWYkvo3lTJaSrMAGFvn5C-IoU4xF474jirAmyhRcgUhrFaSk8SV4wtJVgMMkZvnbUttIGs7oum0LLAoukXlig+kUlwkC5KMLb0zic0Jw98iyXsFKR0O1DqqLdM4IiBhnTunxPkYa5wcBYAgHAUQ-haoausgAWlAUsBhJJfxZGIrExALqcjkiDTlMZqglgsVbqQJ1ZjrIknWXUZQAJdAMPKIGeuVVrjRs2hkQochLbitsa4NKtl432ETbLFN-l67XD6FmihjQPIVyyo+KUjgS7X0sAmvQZRqysIBixFELA6261Shlb4BQSiQhuaUeUrg6QsOKQuQ4xL65ch5PyYdFopy0hLDDKdywZ2l07WW7tHC+0rvqbgXU30ICbsih1eQygcxtp7Ya1Kx7FCnt7VpK1l7QwRmjCjO9w8pSDPAY1SkSxawgkpBEso09iSEoZCxAyQHebOoyMfaQtYWgTgML6N9rCNEOAAq4LFv4UNsRbrxA8QwTJmTAMB2N0VtDYaWPBskmwJaNF2AXCpGw5V1z-ahzJsEEJMcw1HbD2RcNqAhGbDyk9bSGFYU4eGwmqM+Po2eRj6GY0ZBJLIVjMh2PxXJLPWwhgySkUaMUxVWpnZodMdmxAjgPJSgdPHIoO1FAgiI3mT4yxmgODFhsRWyNMmlTEWAKqEmrAAgtiwpYgKnm6A-Dxjz+wRw2GhuFluj0MYQTi9mY1VoASfFswGSmEcviyMLloPtLQ8s+IIBzFCXMkbFfJLJYocU+3rDFgp78JIsjWygTYROf7HOZLVjgDW4RYt6Zc9UBL89WGfGdMMtLEdcxaEM8RAE5sL3cKdkjfhbtbrf2Ky0TtHmjBeaWGsmrGiST1dY4CCNjdRjBWK8DC27kawnEMDIQbKU4R5tUICDYEGlyfbbmnFrX2hgdxgL9xQsgAdA2B5pE6X4xbxwysUxB9meGCIyZBYrqlpXOEq0YRw+JCOnF2M6Tb4S0rhvrp81+Pj35k9gFdpbFCJXDlpyHBnH4cxERuYoRqOq2Sc754Y9eEjKfmwud6ZopwJ4gscaPCmU9rYuHl3+rnSuID+MCQmVXk5vhLmcAMxcTDvzQiLdcuEdSTtXsVz4qLuMVeC5Hdc2wI5FBKKTc0N96jdgZU8I1UD1gHb1P2VbgPRMlH5prOSZZAL7nuZ9WSX80P1AsWVT91P2dbS0mJPHX0hgvUrmpI+S2FINAyGrq4tNf7S88-CMqgXzmheVOZzXwFqbzYOLdD1Qw7Cy1LBaICxsO8kWoC67mFciUzX-GxSlCiearTwkg+bSchxdI+CAA */
  id: 'app',

  initial: window.ipc.getSelfStateSync("route") ?? "onSetup",

  states: {
    onSetup: {
      on: {
        loadPlugin: "onPluginLoad"
      }
    },

    onPluginLoad: {
      entry() {
        addSyncProcess(() => runPluginLfe('onPluginLoad', []))
      },

      on: {
        loadCSS: {
          target: "onLoadCSS",
          reenter: true
        }
      }
    },

    onLoadCSS: {
      on: {
        singuping: {
          target: "onSignUp",
          reenter: true
        },

        logining: {
          target: "onLogin",
          reenter: true
        }
      },
      entry() {
        addAsyncProcess(async () => runPluginLfe('onLoadCSS', await db.app.getAllStyle()))
      }
    },

    onLogin: {
      always: {
        target: "onAuthed",
        reenter: true,
        guard({ event }) {
          if (event.type != 'logining') return false
          addAsyncProcess(async () => {
            const user = await login(event.data)
            runPluginLfe('onLogin', user)
          })
          return true
        }
      },
    },

    onSignUp: {
      always: {
        target: "onAuthed",
        guard({ event }) {
          if (event.type != 'singuping') return false
          addAsyncProcess(async () => {
            const user = await signUp(event.data)
            runPluginLfe('onSignUp', user)
          })
          return true
        },
      },
    },

    onAuthed: {
      always: {
        target: "onHomeRouter",
        reenter: true,
        guard({ context: { router } }) {
          addAsyncProcess(async () => {
            const { user } = useUserStore()
            await router.replace('/main')
            window.ipc.toTop()
            runPluginLfe('onAuthed', toUserWebSave(user))
            nowRouterState.value = "onHomeRouter"
          })
          return true
        }
      },
    },

    onHomeRouter: {
      entry() {
        addAsyncProcess(async () => {

          runPluginLfe('onHomeRouter')
        })
      },

      on: {
        quit: {
          target: "router",
          reenter: true
        }
      }
    },

    onChatRouter: {
      states: {
        onSendingMessage: {
          always: {
            target: "onTalk",
            reenter: true,
            guard({ event }) {
              addSyncProcess(() => event.type == 'sendButtonClick' && runPluginLfe('onSendingMessage', event.msg))
              return true
            }
          },
        },

        onTalk: {
          on: {
            receive: "onMessage",
            sendButtonClick: {
              target: "onSendingMessage",
              reenter: true
            }
          },
          entry() {
            addSyncProcess(() => {
              const { links } = useAppStore()
              const toUid = toNumber(location.pathname.replace(/\/.+\//g, ''))
              runPluginLfe('onTalk', links.find(({ uid }) => uid == toUid)!)
            })
          }
        },

        onMessage: {
          always: {
            target: "onTalk",
            reenter: true,
            guard({ event }) {
              addSyncProcess(() => event.type == 'receive' && runPluginLfe('onMessage', event.msg))
              return true
            }
          },
        }
      },

      initial: "onTalk",

      entry() {
        addAsyncProcess(async () => {
          runPluginLfe('onChatRouter')
        })
      },

      on: {
        quit: {
          target: "router",
          reenter: true
        }
      }
    },

    onPluginRouter: {
      states: {
        onRemovePlugin: {
          always: {
            target: "onShowPluginAbout",
            reenter: true,
            guard({ event }) {
              if (event.type != 'remove') return false
              addSyncProcess(() => runPluginLfe('onRemovePlugin', event.data))
              return true
            }
          },
        },

        onShowPluginAbout: {
          on: {
            downLoad: "onDonwloadPlugin",
            selOther: "onSelectPlugin",
            remove: "onRemovePlugin"
          }
        },

        onSelectPlugin: {
          always: {
            reenter: true,
            target: "onShowPluginAbout",
            guard({ event }) {
              if (event.type == 'sel' || event.type == 'selOther') {
                addSyncProcess(() => runPluginLfe('onSelectPlugin', event.data))
                return true
              }
              return false
            }
          },
        },

        onDonwloadPlugin: {
          always: {
            target: "onShowPluginAbout",
            reenter: true,
            guard({ event }) {
              if (event.type != 'downLoad') return false
              addSyncProcess(() => runPluginLfe('onDownloadPlugin', event.data))
              return false
            }
          },
        },

        onLoadPluginMenu: {
          on: {
            sel: "onSelectPlugin"
          },
          entry() {
            addSyncProcess(() => runPluginLfe('onLoadPluginMenu', []))
          }
        }
      },

      entry() {
        addSyncProcess(() => runPluginLfe('onPluginRouter'))
      },

      initial: "onLoadPluginMenu",

      on: {
        quit: {
          target: "router",
          reenter: true
        }
      }
    },

    onSettingRouter: {
      states: {
        onSettingChange: {
          on: {
            changingSetting: "onSettingChange"
          },
          entry({ event }) {
            if (event.type != 'changingSetting') return
            addSyncProcess(() => runPluginLfe('onSettingChange', event.data))
          }
        }
      },

      initial: "onSettingChange",

      entry() {
        addAsyncProcess(async () => {
          runPluginLfe('onSettingRouter')
        })
      },

      on: {
        quit: {
          target: "router",
          reenter: true
        }
      }
    },

    onAddressRouter: {
      states: {
        onLoadAddressMenu: {
          on: {
            addUser: "onAddUser",
            addTempUser: "onAddTempUser",
            removeUser: "onRemoveUser"
          },
          entry() {
            addSyncProcess(() => {
              const { user } = useUserStore()
              runPluginLfe('onLoadAddressMenu', user.link.chat.map(v => v.uid))
            })
          }
        },

        onAddUser: {
          always: {
            target: "onLoadAddressMenu",
            reenter: true,
            guard({ event }) {
              addSyncProcess(() => event.type == "addUser" && runPluginLfe('onAddUser', event.user))
              return true
            }
          },
        },

        onAddTempUser: {
          always: {
            target: "onLoadAddressMenu",
            reenter: true,
            guard({ event }) {
              addSyncProcess(() => event.type == "addTempUser" && runPluginLfe('onAddTempUser', event.user))
              return true
            }
          }
        },

        onRemoveUser: {
          always: {
            target: "onLoadAddressMenu",
            reenter: true,
            guard({ event }) {
              addSyncProcess(() => event.type == "removeUser" && runPluginLfe('onRemoveUser', event.user))
              return true
            }
          },
        }
      },

      initial: "onLoadAddressMenu",

      entry() {
        addSyncProcess(() => {
          runPluginLfe('onAddressRouter')
        })
      },

      on: {
        quit: {
          target: "router",
          reenter: true
        }
      }
    },

    router: {
      on: {
        goChat: {
          target: "onChatRouter",
          reenter: true,
          guard({ context: { router, data_goChat } }) {
            addAsyncProcess(async () => {
              data_goChat.dev ? (await router.replace(`/main/dev/chat`)) : (await router.replace(`/main/chat/${data_goChat.type}/${data_goChat.uid}`))
            })
            return !!(nowRouterState.value = "onChatRouter")
          }
        },

        goPlugin: {
          target: "onPluginRouter",
          reenter: true,
          guard() {
            addAsyncProcess(async () => {
              // await router.replace('/main/address')
            })
            return !!(nowRouterState.value = "onPluginRouter")
          }
        },

        goSetting: {
          target: "onSettingRouter",
          reenter: true,
          guard() {
            addAsyncProcess(async () => {
              await router.replace('/main/setting/app')
              console.log('router to setting');

            })
            return !!(nowRouterState.value = "onSettingRouter")
          }
        },

        goAddress: {
          target: "onAddressRouter",
          reenter: true,
          guard({ context: { router } }) {
            addAsyncProcess(async () => {
              await router.replace('/main/address')
            })
            return !!(nowRouterState.value = "onAddressRouter")
          }
        },

        goQuitApp: {
          target: "quitApp",
          reenter: true
        },

        goDev: {
          target: "onDevRouter",
          reenter: true,
          guard({ context: { router } }) {
            addAsyncProcess(async () => {
              await router.replace('/main/dev')
            })
            return !!(nowRouterState.value = "onDevRouter")
          }
        },

        goHome: {
          target: "onHomeRouter",
          reenter: true,
          guard({ context: { router } }) {
            addAsyncProcess(async () => {
              await router.replace('/main')
            })

            return !!(nowRouterState.value = "onHomeRouter")
          }
        }
      },
      entry({ event, context }) {
        if (event.type != "quit") return
        addSyncProcess(() => {
          (event.to == 'goChat') && (context.data_goChat = event.params)
          actor.send({ type: event.to })
        })
      }
    },

    onDevRouter: {
      states: {
        onLoadDevMenu: {
          entry() {
            addSyncProcess(() => runPluginLfe('onLoadDevMenu'))
            return true
          }
        }
      },
      initial: "onLoadDevMenu",
      entry() {
        addAsyncProcess(async () => {
          runPluginLfe('onDevRouter')
        })
      },

      on: {
        quit: {
          target: "router",
          reenter: true
        }
      }
    },

    quitApp: {
      type: "final"
    },
  },
  context: {
    router,
    data_goChat: { dev: true },
  }
});

export const actor = createActor(appMachine)
export const $setup = () => {
  if (readQuery().get("route") ?? false) {
    console.log(routerMap[readQuery().get("route")!])
    router.push(routerMap[readQuery().get("route")!])
  }
  actor.start()
  return router
}

export { nowRouterState, nowState, on, readQuery, routerMap } from './helper';