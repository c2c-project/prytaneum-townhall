import Mongo from './mongo';

export default async function connect(): Promise<void> {
    try {
        await Mongo.init();
    } catch (e) {
        console.log(e);
    }
}
