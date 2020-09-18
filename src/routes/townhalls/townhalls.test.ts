import request from 'supertest';

import app from 'app';

describe('townhall routes', () => {
    describe('/townhalls', () => {
        it('should be status 200', async () => {
            const { status } = await request(app).get('/townhalls');
            expect(status).toStrictEqual(200);
        });
    });
    describe('/townhalls/:townhallId', () => {
        it('should be status 200', async () => {
            const { status } = await request(app).get('/townhalls/123');
            expect(status).toStrictEqual(200);
        });
    });
    describe('/townhalls/create', () => {
        it('should be status 200', async () => {
            const { status } = await request(app).post('/townhalls/create');
            expect(status).toStrictEqual(200);
        });
    });
    describe('/townhalls/:townhallId/update', () => {
        it('should be status 200', async () => {
            const { status } = await request(app).post('/townhalls/123/update');
            expect(status).toStrictEqual(200);
        });
    });
    describe('/townhalls/:townhallId/bills', () => {
        it('should be status 200', async () => {
            const { status } = await request(app).post('/townhalls/123/bills');
            expect(status).toStrictEqual(200);
        });
    });
    describe('/townhalls/:townhallId/delete', () => {});
    describe('/:townhallId/questions/set-current', () => {});
    describe('/:townhallId/questions/create', () => {});
    describe('/:townhallId/questions/:questionId/update', () => {});
    describe('/:townhallId/questions/:questionId/delete', () => {});
    describe('/:townhallId/questions', () => {});
    describe('/:townhallId/questions/:questionId', () => {});
    
    
});
