FROM mongo:8.0.3

ENV MONGO_REPLICA_PORT=27017
ENV MONGO_REPLICA_HOST=localhost
ENV MONGO_INITDB_ROOT_USERNAME=root
ENV MONGO_INITDB_ROOT_PASSWORD=example

# Copiar script de inicialização
COPY init-replica.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/init-replica.sh

# Expor a porta do MongoDB
EXPOSE $MONGO_REPLICA_PORT

# Comando para iniciar o MongoDB com ReplicaSet
CMD ["bash", "-c", "mongod --port $MONGO_REPLICA_PORT --replSet rs0 --bind_ip_all"]