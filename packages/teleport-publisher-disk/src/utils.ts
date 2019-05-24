import { existsSync, mkdir, writeFile } from 'fs'
import { join } from 'path'

import {
  GeneratedFolder,
  GeneratedFile,
} from '@teleporthq/teleport-generator-shared/lib/typings/generators'

export const writeFolder = async (folder: GeneratedFolder, currentPath: string): Promise<void> => {
  const { name, files, subFolders } = folder

  const folderPath = join(currentPath, name)

  if (!existsSync(folderPath)) {
    await createDirectory(folderPath)
  }

  const promises = [
    writeFilesToFolder(folderPath, files),
    writeSubFoldersToFolder(folderPath, subFolders),
  ]

  await Promise.all(promises)
}

const writeFilesToFolder = async (folderPath: string, files: GeneratedFile[]): Promise<void> => {
  const promises = files.map((file) => {
    const fileName = file.fileType ? `${file.name}.${file.fileType}` : file.name
    const filePath = join(folderPath, fileName)
    return writeContentToFile(filePath, file.content, file.contentEncoding)
  })

  await Promise.all(promises)
}

const writeSubFoldersToFolder = async (
  folderPath: string,
  subFolders: GeneratedFolder[]
): Promise<void> => {
  const promises = subFolders.map((subFolder) => {
    return writeFolder(subFolder, folderPath)
  })

  await Promise.all(promises)
}

const createDirectory = (pathToDir: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    mkdir(pathToDir, { recursive: true }, (err) => {
      err ? reject(err) : resolve()
    })
  })
}

const writeContentToFile = (
  filePath: string,
  fileContent: string,
  encoding: string = 'utf8'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    writeFile(filePath, fileContent, encoding, (err) => {
      err ? reject(err) : resolve()
    })
  })
}