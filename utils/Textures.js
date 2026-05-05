/** --- Textures.js ---
 * Utilitaire de chargement de textures WebGL 2D.
 * Supporte les images power-of-2 (mipmap + repeat) et toutes autres dimensions (clamp + linear).
 * @author Zachary Luheshi, Ken-Li Roux
 */

function chargerTexture(objgl, url) {
    var texture = objgl.createTexture();

    // Pixel gris neutre affiché pendant le chargement asynchrone de l'image
    objgl.bindTexture(objgl.TEXTURE_2D, texture);
    objgl.texImage2D(objgl.TEXTURE_2D, 0, objgl.RGBA, 1, 1, 0,
                     objgl.RGBA, objgl.UNSIGNED_BYTE, new Uint8Array([128, 128, 128, 255]));

    var image = new Image();
    image.src = url;
    image.onload = function() {
        objgl.bindTexture(objgl.TEXTURE_2D, texture);
        objgl.texImage2D(objgl.TEXTURE_2D, 0, objgl.RGBA, objgl.RGBA, objgl.UNSIGNED_BYTE, image);
        if (_estPuissanceDe2(image.width) && _estPuissanceDe2(image.height)) {
            objgl.texParameteri(objgl.TEXTURE_2D, objgl.TEXTURE_WRAP_S, objgl.REPEAT);
            objgl.texParameteri(objgl.TEXTURE_2D, objgl.TEXTURE_WRAP_T, objgl.REPEAT);
            objgl.generateMipmap(objgl.TEXTURE_2D);
        } else {
            objgl.texParameteri(objgl.TEXTURE_2D, objgl.TEXTURE_MIN_FILTER, objgl.LINEAR);
            objgl.texParameteri(objgl.TEXTURE_2D, objgl.TEXTURE_MAG_FILTER, objgl.LINEAR);
            objgl.texParameteri(objgl.TEXTURE_2D, objgl.TEXTURE_WRAP_S, objgl.CLAMP_TO_EDGE);
            objgl.texParameteri(objgl.TEXTURE_2D, objgl.TEXTURE_WRAP_T, objgl.CLAMP_TO_EDGE);
        }
    };

    return texture;
}

function _estPuissanceDe2(v) {
    return (v & (v - 1)) === 0;
}
