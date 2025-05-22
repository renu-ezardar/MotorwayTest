import { FastifyInstance } from 'fastify';
import { VehicleValuationRequest } from './types/vehicle-valuation-request';
// import { fetchValuationFromSuperCarValuation } from '@app/super-car/super-car-valuation';
import { VehicleValuation } from '@app/models/vehicle-valuation';

export function valuationRoutes(fastify: FastifyInstance) {
  fastify.get<{
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
    const valuationRepository = fastify.orm.getRepository(VehicleValuation);
    const { vrm } = request.params;

    if (vrm === null || vrm === '' || vrm.length > 7) {
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    const result = await valuationRepository.findOneBy({ vrm: vrm });

    if (result == null) {
      return reply
        .code(404)
        .send({
          message: `Valuation for VRM ${vrm} not found`,
          statusCode: 404,
        });
    }

    return result;
  });

  fastify.put<{
    Body: VehicleValuationRequest;
    Params: {
      vrm: string;
    };
  }>('/valuations/:vrm', async (request, reply) => {
    const valuationRepository = await fastify.orm.getRepository(VehicleValuation);
    const { vrm } = request.params;
    const { mileage } = request.body;

    if (vrm.length > 7) {
      console.log('vrm bigger than 7')
      return reply
        .code(400)
        .send({ message: 'vrm must be 7 characters or less', statusCode: 400 });
    }

    if (mileage === null || mileage <= 0) {
      return reply
        .code(400)
        .send({
          message: 'mileage must be a positive number',
          statusCode: 400,
        });
    }

    console.log('creating a dummy object only to check the db connection')
    // const valuation = await fetchValuationFromSuperCarValuation(vrm, mileage);
    const valuation = new VehicleValuation();
    valuation.vrm = 'VRM100';
    valuation.lowestValue = 10000;
    valuation.highestValue = 20000;
    console.log(JSON.stringify(valuation))
    console.log('finishing valuation')

    // Save to DB.
    await valuationRepository.insert(valuation)
    .then(() => console.log('successfully inserted to the db'))
    .catch((err) => {
      console.log('ops, something wrong happened')
      console.log(err)
      if (err.code !== 'SQLITE_CONSTRAINT') {
        throw err;
      }
    });

    fastify.log.info('Valuation created: ', valuation);

    return valuation;
  });
}
