import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import prompts from 'prompts'
import {
    red,
    reset,
} from 'kolorist'

const cwd = process.cwd()

const renameFiles: Record<string, string | undefined> = {
    _gitignore: '.gitignore',
}

const defaultTargetDir = 'whatsit-ui-project'

async function init() {

    let targetDir = ''
    const getProjectName = () =>
        targetDir === '.' ? path.basename(path.resolve()) : targetDir

    let result: prompts.Answers<
        'projectName' | 'packageName'
    >

    try {
        result = await prompts(
            [
                {
                    type: targetDir ? null : 'text',
                    name: 'projectName',
                    message: reset('Project name:'),
                    initial: defaultTargetDir,
                    onState: (state) => {
                        targetDir = formatTargetDir(state.value) || defaultTargetDir
                    },
                },
                {
                    type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
                    name: 'packageName',
                    message: reset('Package name:'),
                    initial: () => toValidPackageName(getProjectName()),
                    validate: (dir) =>
                        isValidPackageName(dir) || 'Invalid package.json name',
                },
            ],
            {
                onCancel: () => {
                    throw new Error(red('✖') + ' Operation cancelled')
                },
            },
        )
    } catch (cancelled: any) {
        console.log(cancelled.message)
        return
    }

    // user choice associated with prompts
    const { packageName } = result

    const root = path.join(cwd, targetDir)

    emptyDir(root)

    if (!fs.existsSync(root)) {
        fs.mkdirSync(root, {recursive: true})
    }

    // determine template
    let template: string = 'template'

    const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent)
    const pkgManager = pkgInfo ? pkgInfo.name : 'npm'

    console.log(`\nScaffolding project in ${root}...`)

    const templateDir = path.resolve(
        fileURLToPath(import.meta.url),
        '../..',
        `${template}`,
    )

    const write = (file: string, content?: string) => {
        const targetPath = path.join(root, renameFiles[file] ?? file)
        if (content) {
            fs.writeFileSync(targetPath, content)
        } else {
            copy(path.join(templateDir, file), targetPath)
        }
    }

    const files = fs.readdirSync(templateDir)
    for (const file of files.filter((f) => f !== 'package.json')) {
        write(file)
    }

    const pkg = JSON.parse(
        fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'),
    )

    const serverPkg = JSON.parse(
        fs.readFileSync(path.join(templateDir, `./server/package.json`), 'utf-8'),
    )

    pkg.name = packageName || getProjectName()
    serverPkg.name = pkg.name + '-backend'

    write('package.json', JSON.stringify(pkg, null, 2) + '\n')

    write('./server/package.json', JSON.stringify(serverPkg, null, 2) + '\n')

    const cdProjectName = path.relative(cwd, root)
    console.log(`\nDone. Now run:\n`)
    if (root !== cwd) {
        console.log(
            `  cd ${
                cdProjectName.includes(' ') ? `"${cdProjectName}"` : cdProjectName
            }`,
        )
    }
    switch (pkgManager) {
        case 'yarn':
            console.log('  yarn')
            console.log('  yarn dev')
            break
        default:
            console.log(`  ${pkgManager} install`)
            console.log(`  ${pkgManager} run dev`)
            break
    }
    console.log()
}

function formatTargetDir(targetDir: string | undefined) {
    return targetDir?.trim().replace(/\/+$/g, '')
}

function copy(src: string, dest: string) {
    const stat = fs.statSync(src)
    if (stat.isDirectory()) {
        copyDir(src, dest)
    } else {
        fs.copyFileSync(src, dest)
    }
}

function isValidPackageName(projectName: string) {
    return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
        projectName,
    )
}

function toValidPackageName(projectName: string) {
    return projectName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/^[._]/, '')
        .replace(/[^a-z\d\-~]+/g, '-')
}

function copyDir(srcDir: string, destDir: string) {
    fs.mkdirSync(destDir, {recursive: true})
    for (const file of fs.readdirSync(srcDir)) {
        const srcFile = path.resolve(srcDir, file)
        const destFile = path.resolve(destDir, file)
        copy(srcFile, destFile)
    }
}

function emptyDir(dir: string) {
    if (!fs.existsSync(dir)) {
        return
    }
    for (const file of fs.readdirSync(dir)) {
        if (file === '.git') {
            continue
        }
        fs.rmSync(path.resolve(dir, file), {recursive: true, force: true})
    }
}

function pkgFromUserAgent(userAgent: string | undefined) {
    if (!userAgent) return undefined
    const pkgSpec = userAgent.split(' ')[0]
    const pkgSpecArr = pkgSpec.split('/')
    return {
        name: pkgSpecArr[0],
        version: pkgSpecArr[1],
    }
}

init().catch((e) => {
    console.error(e)
})