github:
	rm -rf docs
	cp -r dist/ docs
	git add -A
	git commit -m "update dev version"
	git push

live:
	aws s3 sync dist s3://pudding.cool/2017/07/cetaceans --delete
	aws cloudfront create-invalidation --distribution-id E13X38CRR4E04D --paths '/2017/07/cetaceans*'  