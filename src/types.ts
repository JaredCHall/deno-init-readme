/** Represents the settings for a JSR module */
export interface ModuleSettings {
  name: string
  jsrScope: string
  jsrModule: string
  description?: string
  githubPath?: string
  githubRepo?: string
  githubUser?: string
}