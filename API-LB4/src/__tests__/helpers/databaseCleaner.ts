
import {ScrapyAppDb} from '../../datasources';
import {BaseCityRepository, BaseCountryRepository, BaseForecastRepository, BaseSourceRepository} from '../../repositories';

const db = new ScrapyAppDb();


export async function givenEmptyDatabase() {
  const tablesToBeCleaned = ['forecast', 'country', 'city', 'source'];

  let deleteBlock = '';
  for (const tableName of tablesToBeCleaned) {
    deleteBlock += `DELETE FROM ${tableName};`;
    deleteBlock += `ALTER SEQUENCE ${tableName}_id_seq RESTART WITH 1;`;
  }

  const deletionQuery = `TRUNCATE ${tablesToBeCleaned.join(',')} RESTART IDENTITY CASCADE;`;
  await db.execute(deletionQuery, []);


  const baseForecastRepository: BaseForecastRepository = new BaseForecastRepository(
    new ScrapyAppDb,
    async () => baseCityRepository,
    async () => baseCountryRepository,
    async () => baseSourceRepository,

  );

  const baseCountryRepository: BaseCountryRepository = new BaseCountryRepository(
    new ScrapyAppDb,
    async () => baseForecastRepository,
    async () => baseCityRepository,
  );


  const baseCityRepository: BaseCityRepository = new BaseCityRepository(
    new ScrapyAppDb,
    async () => baseForecastRepository,
    async () => baseCountryRepository,
  );


  const baseSourceRepository: BaseSourceRepository = new BaseSourceRepository(
    new ScrapyAppDb,
    async () => baseForecastRepository
  );

}
