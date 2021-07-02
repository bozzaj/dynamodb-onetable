/*
    model-schema-typescript.ts - Create an inline model using typescript
 */
import {AWS, Client, Entity, Model, Table, dump, print} from './utils/init'

const table = new Table({
    name: 'InlineModelTypeScriptTestTable',
    client: Client,
    schema: {
        indexes: {primary: {hash: 'pk'}},
        models: {},
    }
})

const CardSchema = {
    pk:     { type: String, value: 'card:${id}' },
    id:     { type: Number },
    issuer: { type: String },
}
type CardType = Entity<typeof CardSchema>
let Card: Model<CardType> = null

test('Create table', async () => {
    if (!(await table.exists())) {
        await table.createTable()
    }
})

test('Create model', async () => {
    //  This model is free-standing not added to the list of table models
    Card = new Model<CardType>(table, 'Card', {
        fields: CardSchema,
        indexes: {primary: {hash: 'pk'}},
    })
    let models = table.listModels()
    expect(models.length).toBe(0)
})

test('Create item', async () => {
    let card = await Card.create({id: 42, issuer: 'visa'}, {hidden: true})
    expect(card.issuer).toBe('visa')
    expect(card.pk).toBe('card:42')
})

test('Add model', async() =>{
    table.addModel('Card', CardSchema)

    let models = table.listModels()
    expect(models.length).toBe(1)
    expect(models[0]).toBe('Card')

    let Card = table.getModel<CardType>('Card')
    expect(Card).toBeDefined()
    let card = await Card.create({id: 99, issuer: 'amex'})
    expect(card.issuer).toBe('amex')
})

test('Remove model', async() => {
    table.removeModel('Card')
    let models = table.listModels()
    expect(models.length).toBe(0)

    await expect(async() => {
        table.removeModel('Unknown')
    }).rejects.toThrow()
})

test('Destroy table', async() => {
    await table.deleteTable('DeleteTableForever')
})
