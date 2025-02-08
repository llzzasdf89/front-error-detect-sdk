import typescript from "@rollup/plugin-typescript"
export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.ts',
        format: 'cjs'
    },
    plugins: [
        typescript({
            tsconfig: './tsconfig.json'
        })
    ]
}