/**
 * @class SceneNode
 * @desc A SceneNode is a node in the scene graph.
 * 
 * @property {MeshDrawer} meshDrawer - The MeshDrawer object to draw
 * @property {TRS} trs - The TRS object to transform the MeshDrawer
 * @property {SceneNode} parent - The parent node
 * @property {Array<SceneNode>} children - The child nodes
 *
 */
class SceneNode {
    constructor(meshDrawer, trs, parent = null) {
        this.meshDrawer = meshDrawer;
        this.trs = trs;        
        this.parent = parent;
        this.children = [];

        // If parent is provided, add this node to the parent's children array
        if (parent) {
            this.parent.__addChild(this);
        }
    }

    __addChild(node) {
        this.children.push(node);
    }

    draw(mvp, modelView, normalMatrix, modelMatrix) {
        // 1) Get this node’s local 4×4 from TRS (translation, rotation, scale)
        let localMatrix = this.trs.getTransformationMatrix();

        // 2) Multiply incoming parent matrices by the local matrix

        let newModelMatrix = MatrixMult(modelMatrix, localMatrix);
        let newModelView  = MatrixMult(modelView,  localMatrix);
        let newMvp        = MatrixMult(mvp,        localMatrix);

        // 3) Compute a new normal matrix from newModelView

        let newNormalMatrix = getNormalMatrix(newModelView);

        // 4) Draw this node’s mesh, if it exists
        if (this.meshDrawer) {

            this.meshDrawer.draw(newMvp, newModelView, newNormalMatrix, newModelMatrix);
        }

        // 5) Recursively draw children
        for (let child of this.children) {
            child.draw(newMvp, newModelView, newNormalMatrix, newModelMatrix);
        }
    }
}
