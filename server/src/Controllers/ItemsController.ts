import {Request, Response} from 'express';
import knex from '../database/connection';

class ItemsController {
  async index(request: Request, response: Response) {
    const items = await knex('items').select('*');
  
    const serializedItems = items.map(item => {
      return {
        id: item.id,
        name: item.title,
        image_url: `https://server.dgspace.com.br/uploads/${item.image}`,
      }
    })
    return response.json(serializedItems);
  }
}

export default ItemsController;