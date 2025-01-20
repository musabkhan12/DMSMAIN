export var fieldnamesmapping:any ={
    'lastModifiedDateTime':"Published Date",
    'FileType':'Document Type',
    'createdBy':'Uploaded By',
    'fileType':'Document Type',
    'fileExtension':"File Extension",
}

export const removeDuplicates=<T>(array: T[], key: keyof T): T[]=> {
    const seen = new Set();
    return array.filter(item => {
        const value = item[key];
        if (seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
}