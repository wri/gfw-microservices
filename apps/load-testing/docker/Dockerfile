FROM grafana/k6:0.49.0

WORKDIR /load-testing

COPY config config
COPY scripts scripts

CMD ["k6", "run", "scripts/smoke.test.js"]

