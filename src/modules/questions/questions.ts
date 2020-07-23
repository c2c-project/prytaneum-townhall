/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { ObjectID } from 'mongodb';

import Collections, { QuestionForm, QuestionDoc } from 'db';
import io from 'lib/socket-io';

export async function createQuestion(form: QuestionForm, townhallId: string) {
    return Collections.Questions().insertOne({
        form,
        townhallId: new ObjectID(townhallId),
        status: {
            isAsked: false,
            timestamp: null,
        },
    });
}
export function updateQuestion(
    form: QuestionForm,
    questionId: string,
    townhallId: string
) {
    return Collections.Questions().updateOne(
        { _id: new ObjectID(questionId), townhallId: new ObjectID(townhallId) },
        { $set: { form } }
    );
}

export function deleteQuestion(questionId: string, townhallId: string) {
    return Collections.Questions().deleteOne({
        _id: new ObjectID(questionId),
        townhallId: new ObjectID(townhallId),
    });
}

export function getQuestions(townhallId: string) {
    return Collections.Questions()
        .find({
            townhallId: new ObjectID(townhallId),
        })
        .toArray();
}

export function getQuestion(townhallId: string, questionId: string) {
    return Collections.Questions().findOne({
        townhallId: new ObjectID(townhallId),
        questionId: new ObjectID(questionId),
    });
}

export function askQuestion(questionId: string, townhallId: string) {
    return Collections.Questions().updateOne(
        { _id: new ObjectID(questionId), townhallId: new ObjectID(townhallId) },
        {
            $set: {
                'status.isAsked': true,
                'status.timestamp': new Date().toISOString(),
            },
        }
    );
}

export function setupChangeStream() {
    const ioQuestion = io.of('/questions');

    /**
     * @description function to run on connection, joins the appropriate room
     * @arg {Object} socket given by socketio
     */
    function onConnection(socket: SocketIO.Socket) {
        const { townhallId } = socket.handshake.query as {
            townhallId?: string;
        };
        if (townhallId) {
            socket.join(townhallId);
        }
    }

    function emitQuestion(
        doc: QuestionDoc,
        type: 'insert' | 'update' | 'delete' | 'current-question'
    ) {
        const { townhallId } = doc;
        ioQuestion.to(townhallId.toHexString()).emit('question', {
            type,
            payload: doc,
        });
    }

    ioQuestion.on('connection', onConnection);

    const changeStream = Collections.Questions().watch({
        fullDocument: 'updateLookup', // option to give the full document in an update operation in the change stream
    });

    changeStream.on('change', (next) => {
        switch (next.operationType) {
            case 'insert':
                // in an insert operation next.fullDocument is guaranteed
                // https://docs.mongodb.com/manual/reference/change-events/#change-stream-output
                emitQuestion(next.fullDocument as QuestionDoc, 'insert');
                break;
            case 'update':
                // same as above, guaranteed in an update
                emitQuestion(next.fullDocument as QuestionDoc, 'update');
                break;
            case 'delete':
                // TODO: implement delete, not sure how I want to do this right now
                break;
            default:
            // do nothing
        }
    });
}
