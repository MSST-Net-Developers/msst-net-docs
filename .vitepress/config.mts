import { defineConfig, type DefaultTheme } from 'vitepress'

// 中文侧边栏
function sidebarZh(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '接入 MSST-Net',
      items: [
        { text: '新手教程（？）', link: '/connect/start.md' },
        { text: '版本更新说明', link: '/connect/changelog.md' },
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
          { text: '安全模型', link: '/connect/basics/security.md' },
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
  ]
}

// 英文侧边栏
function sidebarEn(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'Connecting to MSST-Net',
      items: [
        { text: 'Getting Started', link: '/en/connect/start.md' },
        { text: 'Release Notes', link: '/en/connect/changelog.md' },
        { text: 'Installation', items: [
          { text: 'Installing the Client', link: '/en/connect/install/client.md' },
          { text: 'System Service', link: '/en/connect/install/service.md' },
          { text: 'Controller', link: '/en/connect/install/controller.md' },
          { text: 'WebUI Remote Management', link: '/en/connect/install/webui.md' },
          { text: 'Client Configuration', link: '/en/connect/install/configuration.md' },
        ]},
        { text: 'Basics', items: [
          { text: 'Architecture', link: '/en/connect/basics/architecture.md' },
          { text: 'Authentication', link: '/en/connect/basics/authentication.md' },
          { text: 'Identifiers', link: '/en/connect/basics/identifiers.md' },
          { text: 'Connections', link: '/en/connect/basics/connections.md' },
          { text: 'Security Model', link: '/en/connect/basics/security.md' },
        ]},
        { text: 'Access Modes', items: [
          { text: 'Network Mode', link: '/en/connect/spaces/network_space.md' },
          { text: 'Room Mode', link: '/en/connect/spaces/room_space.md' },
          { text: 'Room Relay', link: '/en/connect/spaces/room_relay.md' },
        ]},
        { text: 'Access Control', items: [
          { text: 'Firewall Rules', link: '/en/connect/acl/rules.md' },
          { text: 'Interactive Authorization', link: '/en/connect/acl/interactive_auth.md' },
          { text: 'Permission Groups', link: '/en/connect/acl/groups.md' },
          { text: 'Access Log', link: '/en/connect/acl/access_log.md' },
        ]},
        { text: 'Extras', items: [
          { text: 'MSST-Net ezPlay', link: '/en/connect/extras/ezplay.md' },
          { text: 'Custom Domains', link: '/en/connect/extras/custom_domains.md' },
        ]},
        { text: 'Self-Hosting', items: [
          { text: 'Self-Hosted Relay', link: '/en/connect/selfhost/relay.md' },
        ]},
        { text: 'Troubleshooting', items: [
          { text: 'Diagnostics', link: '/en/connect/troubleshoot/diagnostics.md' },
          { text: 'FAQ', link: '/en/connect/faq.md' },
        ]},
      ]
    }
  ]
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  metaChunk: true,
  cleanUrls: true,
  title: "MSST-Net",
  
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh',
      description: "虽是远在天边，犹如近在眼前",
      themeConfig: {
        sidebar: sidebarZh(),
        outline: { label: '页面导航' },
        docFooter: { prev: '上一页', next: '下一页' },
        langMenuLabel: '切换语言',
        returnToTopLabel: '回到顶部',
        sidebarMenuLabel: '菜单',
        darkModeSwitchLabel: '主题',
        lightModeSwitchTitle: '切换到浅色模式',
        darkModeSwitchTitle: '切换到深色模式',
        notFound: {
          title: '页面未找到',
          quote: '虽是远在天边，这个页面却不在眼前。',
          linkLabel: '前往首页',
          linkText: '带我回首页'
        },
        footer: {
          message: '由 MSST-Net 开发组设计，Claude Code 开发',
          copyright: 'Copyright © 2021-2026 MSST 十周年部计算机办'
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/MSST-Net-Developers' }
        ]
      }
    },
    en: {
      label: 'English',
      lang: 'en',
      link: '/en/',
      description: "Though far away, it feels right next to you",
      themeConfig: {
        sidebar: sidebarEn(),
        footer: {
          message: 'Designed by the MSST-Net Developers, built with Claude Code',
          copyright: 'Copyright © 2021-2026 MSST 10th Anniversary Dept. Computing Office'
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/MSST-Net-Developers' }
        ]
      }
    }
  }
})
