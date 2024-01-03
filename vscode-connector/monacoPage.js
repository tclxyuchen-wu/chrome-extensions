(() => {
  const isContentWorld = !window.content_world
  const useMessage = ({ sendPrefix, listenPrefix, cloneInto }) => {
    let r,
      i,
      s,
      o = 1
    const a = {}
    let c = false
    let l = []
    const d = (e) => {
      const ttt = ++o
      return (a[o] = e), ttt
    }
    const eventDispatch = (eventName, eventOptions) => {
      const { messageType, data, result, n: o } = eventOptions
      const eventHandler = (event, option, obj) => {
        let res
        if (obj) {
          res = createEvent("MutationEvent")
          res.initMutationEvent(
            event,
            false,
            false,
            obj || null,
            void 0,
            void 0,
            JSON.stringify(option),
            MutationEvent.ADDITION
          )
        } else {
          const detail = cloneInto ? cloneInto(option, window.document) : option
          res = new CustomEvent(event, { detail })
        }
        return res
      }
      const targetEvent = eventHandler(
        eventName,
        {
          m: messageType,
          a: data,
          r: result,
        },
        o
      )

      dispatchEvent.apply(window, [targetEvent])
    }
    const u = (u_param) => {
      const {
        m: n,
        r: o,
        a: d,
      } = (u = u_param) instanceof CustomEvent ? u.detail : JSON.parse(u.attrName)
      var u
      if ("bridge.onpurge" == n)
        (async () => {
          await null, s !== window.document.documentElement && m.refresh()
        })()
      else if ("unlock" == n) {
        c = false
        const e = l
          ; (l = []), e.forEach((e) => e())
      } else if ("message.response" == n) {
        if (null == o) throw "Invalid Message"
          ; ((param1, param2) => {
            let n
            param1 && (n = a[param1]) && (n(param2), delete a[param1])
          })(o, d)
      } else if (r) {
        const s = o
          ? (data) => {
            eventDispatch(`${sendPrefix}_${i}`, {
              messageType: "message.response",
              data,
              result: o,
            })
          }
          : () => { }
        r(
          {
            method: n,
            args: d,
            node: u_param instanceof MutationEvent ? u_param.relatedNode : void 0,
          },
          s
        )
      }
    }
    const f = (e) => {
      e && (i = e),
        i &&
        ((s = window.document.documentElement),
          addEventListener(`${listenPrefix}_${i}`, u, true))
    }
    let p = () => { }
    const manage = {
      init: async (init_p) => {
        i ? f() : f(init_p),
          await (function () {
            let e
            return (
              (e = void 0),
              new Promise((promise_p) => {
                const n = window.document.readyState
                "interactive" == n || "complete" == n
                  ? (e && e(), promise_p())
                  : window.addEventListener(
                    "DOMContentLoaded",
                    () => {
                      e && e(), promise_p()
                    },
                    { capture: true, once: true }
                  )
              })
            )
          })(),
          isContentWorld
            ? ((s = document.documentElement),
              (p = () => {
                s !== document.documentElement &&
                  (manage.refresh(),
                    eventDispatch(`${sendPrefix}_${i}`, {
                      messageType: "unlock",
                      data: void 0,
                      result: null,
                    }))
              }))
            : new Promise((e) => {
              if (isContentWorld) throw "not supported"
              {
                const mutationInstance = new MutationObserver((n) => {
                  n.some((e) =>
                    ((e, tggg) => {
                      for (let n = 0, r = e.length;n < r;n++)
                        if (e[n] === tggg) return true
                      return false
                    })(e.addedNodes, document.documentElement)
                  ) && (e(document), mutationInstance.disconnect())
                })
                init_p.observe(document, { childList: true })
              }
            }).then(() => {
              c = true
              manage.send("bridge.onpurge")
              manage.refresh()
            })
      },
      refresh: () => {
        const e = i
        e && (manage.cleanup(), manage.init(e))
      },
      switchId: (e) => {
        i && manage.cleanup(), f(e)
      },
      send: (messageType, data, r, s) => {
        let o, a
        "function" != typeof r && null !== r ? ((o = r), (a = s)) : (a = r),
          isContentWorld && p()
        const u = () =>
          eventDispatch(`${sendPrefix}_${i}`, {
            messageType,
            data,
            result: a ? d(a) : null,
            n: o,
          })
        c ? l.push(u) : u()
      },
      sendToId: (sendToId_p1, sendToId_p2, sendToId_p3) => {
        eventDispatch(`${sendPrefix}_${sendToId_p1}`, {
          messageType: sendToId_p2,
          data: sendToId_p3,
          result: null,
        })
      },
      setMessageListener: (e) => {
        r = e
      },
      cleanup: () => {
        i &&
          (removeEventListener(`${listenPrefix}_${i}`, u, true),
            (s = void 0),
            (i = void 0))
      },
    }
    return manage
  }
  const createBtn = (self, node, channel) => {
    const btn = self.document.createElement("div")
    btn.innerText = "打开vscode"
    btn.className = "vscode-open-btn"
    btn.style = "position: absolute;top: 0;right: 0;background-color: #25aff3; font-size: 13px;line-height: 24px;height: 24px;padding: 0 6px; border-radius: 4px;color: #fff; cursor: pointer;"
    node.appendChild(btn)
    node.style.position = "relative"
    btn.addEventListener("click", () => {
      channel.send("userscripts", {
        action: "openVscode",
      })
    })
  }

  const startWork = async (self, node) => {
    self.addEventListener("message", ({ data }) => {
      const { messageType, args } = data
      if (messageType !== "userscripts") return
      const { action, value } = args
      if (action === "get") {
        let value
        if (self.alleMonacoEditor) {
          value = self.alleMonacoEditor.getValue()
        } else if (self.monaco && self.monaco.editor) {
          value = self.monaco.editor.getModels()[0].getValue()
        } else {
          value = ''
        }
        self.postMessage(
          {
            messageType: "userscripts",
            args: {
              action: "getValue",
              value,
              lastModified: Date.now(),
            },
          },
          "*"
        )
      }
      if (action === "patch") {
        console.log('patch', value)
        if (self.alleMonacoEditor) {
          self.alleMonacoEditor.setValue(value)
        } else if (self.monaco && self.monaco.editor) {
          self.monaco.editor.getModels()[0].setValue(value)
        } else {

        }
      }
    })
    const messageChannel = useMessage({
      sendPrefix: "2C",
      listenPrefix: "2P",
    })
    messageChannel.init("bfaqq")
    createBtn(self, node, messageChannel)
  }

  const getMonacoNode = (window) => {
    const node = window.document.querySelector(".monaco-editor")
    return node
  }
  const monacoSensor = setInterval(() => {
    // if (window.MonacoEnvironment || window.monaco) {
    //   targetWindow = window
    //   targetMonacoNode = getMonacoNode(window)
    // } else {
    //   const dom = document.querySelector('iframe[id^="mc-monaco-editor"]')
    //   if (dom && dom.contentWindow.MonacoEnvironment) {
    //     // monaco 编辑器环境在iframe中
    //     targetWindow = dom.contentWindow
    //     targetMonacoNode = getMonacoNode(dom.contentWindow)
    //   }
    // }
    const targetMonacoNode = getMonacoNode(window)
    if (window.MonacoEnvironment && targetMonacoNode) {
      startWork(window, targetMonacoNode)
      clearInterval(monacoSensor)
    }
  }, 500)

})()