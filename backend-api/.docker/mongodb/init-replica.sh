#!/bin/bash
# init-replica.sh

# Aguardar o MongoDB iniciar
sleep 10

# Iniciar o ReplicaSet
mongosh --port $MONGO_REPLICA_PORT --eval "rs.initiate({
  _id: 'rs0',
  members: [{
    _id: 0,
    host: '$MONGO_REPLICA_HOST:$MONGO_REPLICA_PORT'
  }]
})"

# Aguardar o ReplicaSet estar pronto
until mongosh --port $MONGO_REPLICA_PORT --eval "rs.status()" | grep -q '"ok" : 1'; do
  sleep 2
done

# Criar usuário root se não existir
mongosh --port $MONGO_REPLICA_PORT --eval "
  db.getSiblingDB('admin').getUser('$MONGO_INITDB_ROOT_USERNAME') || 
  db.getSiblingDB('admin').createUser({
    user: '$MONGO_INITDB_ROOT_USERNAME',
    pwd: '$MONGO_INITDB_ROOT_PASSWORD',
    roles: [{role: 'root', db: 'admin'}]
  })
"

echo "Inicialização do ReplicaSet concluída!"