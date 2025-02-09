export const createFormData = (base: { [key: string]: any }): FormData => {
    const formData = new FormData()
    for (const key in base) {
        formData.append(key, base[key])
    }
    return formData
}
