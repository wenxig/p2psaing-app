namespace AppPlugin {
  interface PluginPage {

  }
  interface PluginInfo {

  }
  abstract class PluginRouterFunction {
    onChatRouter?(): undefined
    onHomeRouter?(): undefined
    onSettingRouter?(): undefined
    onPluginRouter?(): undefined
    onAddressRouter?(): undefined
    onDevRouter?(): undefined
  }
  abstract class PluginFunction extends PluginRouterFunction {
    onPluginLoad?(allNames: AppPlugin.PluginInfo[]): string[] | undefined
    onLoadCSS?(allStyle: db.app.Code[]): import("./db").default.app.Code[] | undefined
    onLogin?(user: User.WebDbSave): User.WebDbSave | undefined
    onSignUp?(user: User.WebDbSave): User.WebDbSave | undefined
    onAuthed?(user: User.WebDbSave): User.WebDbSave | undefined
    onTalk?(user: User.WebDbSave): User.WebDbSave | undefined
    onMessage?(msg: Peer.Msg.All): Peer.Msg.All | undefined
    onSendingMessage?(msg: Peer.Msg.All): Peer.Msg.All | undefined
    onLoadPluginMenu?(list: AppPlugin.PluginInfo[]): AppPlugin.PluginInfo[] | undefined
    onDownloadPlugin?(plugin: AppPlugin.PluginInfo): AppPlugin.PluginInfo | undefined
    onRemovePlugin?(plugin: AppPlugin.PluginInfo): undefined
    onShowPluginAbout?(plugin: AppPlugin.PluginInfo): undefined
    onSelectPlugin?(plugin: AppPlugin.PluginInfo): AppPlugin.PluginInfo | undefined
    onSettingChange?(change: State.SettingChange): State.SettingChange | undefined
    onLoadAddressMenu?(uids: number[]): undefined
    onAddUser?(user: User.WebDbSave): undefined
    onAddTempUser?(user: User.WebDbSave): undefined
    onRemoveUser?(user: User.WebDbSave): undefined
    onLoadDevMenu?(): undefined
  }
  class Plugin extends PluginFunction {
    [Symbol("id")]: symbol
    name: string
  }
}