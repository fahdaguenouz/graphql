export const XpFormat = (xp) => {
    if (xp >= 1000000) {
        return `${(xp / 1000000).toFixed(2)} MB`;
    } else if (xp >= 1000) {
        return `${(xp / 1000).toFixed(1)} kB`;
    }
    return xp.toString();
};