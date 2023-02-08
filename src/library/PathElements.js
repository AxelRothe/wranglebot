class PathElement {
	chunk = "";

	/**
	 * Creates a Path Element that is made of a string chunk
	 * @param {String} chunk
	 */
	constructor(chunk){
		this.chunk = chunk;
	};
}
module.exports.PathElement = PathElement;
