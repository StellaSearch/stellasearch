.PHONY: data backend frontend dev serve-backend serve-frontend clean distclean

data:
	$(MAKE) -C backend all

backend: data
	$(MAKE) -C backend run

frontend:
	cd frontend && npm run dev

dev: data
	$(MAKE) -j2 serve-backend serve-frontend

serve-backend:
	$(MAKE) -C backend run

serve-frontend:
	cd frontend && npm run dev

clean:
	$(MAKE) -C backend clean

distclean:
	$(MAKE) -C backend distclean
