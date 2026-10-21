import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  transformHead({ assets }) {
    // 需要匹配的字体正则
    const fontPatterns = [
      /HYZhengYuan-55W\.\w+\.woff2/
    ]

    // 查找匹配的字体文件
    const preloadLinks = fontPatterns
      .map(pattern => {
        const foundFont = assets.find(file => pattern.test(file))
        return foundFont
          ? [
              'link',
              {
                rel: 'preload',
                href: foundFont,
                as: 'font',
                type: 'font/woff2',
                crossorigin: ''
              }
            ]
          : null
      })
      .filter(Boolean) // 过滤掉 null 值
    return preloadLinks
  },
  metaChunk: true,
  cleanUrls: true,
  lang: 'zh',
  title: "MSST-Net",
  description: "虽是远在天边，犹如近在眼前",
  themeConfig: {
    sidebar: [
      {
        text: '接入 MSST-Net',
        items: [
          { text: '新手教程（？）', link: '/connect/start.md' },
          { text: '安装部署', items: [
            { text: '安装客户端', link: '/connect/install/client.md' },
            { text: '配置系统服务', link: '/connect/install/service.md' },
            { text: '控制器说明', link: '/connect/install/controller.md' },
            { text: 'WebUI 远程管理', link: '/connect/install/webui.md' },
            { text: '客户端配置', link: '/connect/install/configuration.md' },
          ]},
          { text: '基础概念', items: [
            { text: '系统架构', link: '/connect/basics/architecture.md' },
            { text: '接入认证', link: '/connect/basics/authentication.md' },
            { text: '标识符', link: '/connect/basics/identifiers.md' },
            { text: '连接机制', link: '/connect/basics/connections.md' },
          ]},
          { text: '接入模式', items: [
            { text: '大内网模式', link: '/connect/spaces/network_space.md' },
            { text: '房间模式', link: '/connect/spaces/room_space.md' },
            { text: '房间中转', link: '/connect/spaces/room_relay.md' },
          ]},
          { text: '访问控制', items: [
            { text: '防火墙规则', link: '/connect/acl/rules.md' },
            { text: '交互式授权', link: '/connect/acl/interactive_auth.md' },
            { text: '权限组', link: '/connect/acl/groups.md' },
            { text: '访问记录', link: '/connect/acl/access_log.md' },
          ]},
          { text: '扩展功能', items: [
            { text: 'MSST-Net ezPlay', link: '/connect/extras/ezplay.md' },
            { text: '自定义域名', link: '/connect/extras/custom_domains.md' },
          ]},
          { text: '自建服务', items: [
            { text: '自托管中转服务器', link: '/connect/selfhost/relay.md' },
          ]},
          { text: '诊断与排障', items: [
            { text: '诊断工具', link: '/connect/troubleshoot/diagnostics.md' },
            { text: '常见问题', link: '/connect/faq.md' },
          ]},
        ]
      }
    ],
    footer: {
      message: '由 MSST-Net 开发组设计，Claude Code 开发',
      copyright: 'Copyright © 2021-2026 MSST 十周年部计算机办'
    }
  }
})
