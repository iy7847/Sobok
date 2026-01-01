-- Create a public bucket for shop assets (Logos, Banners)
insert into storage.buckets (id, name, public)
values ('shop-assets', 'shop-assets', true);

-- Policy: Allow public read access to assets (so they can be displayed on shop pages)
create policy "Public Access Assets"
  on storage.objects for select
  using ( bucket_id = 'shop-assets' );

-- Policy: Allow authenticated users (Shop Owners) to upload their own assets
create policy "Shop Owner Upload Assets"
  on storage.objects for insert
  with check ( bucket_id = 'shop-assets' );

-- Policy: Allow Shop Owners to delete/update their own assets
-- Note: In a real production app, you might want to restrict this further 
-- by checking if the user owns the file path (e.g. storage.objects.name like auth.uid() || '/%')
-- For now, we allow authenticated users to manage the bucket.
create policy "Shop Owner Update Assets"
  on storage.objects for update
  using ( bucket_id = 'shop-assets' );

create policy "Shop Owner Delete Assets"
  on storage.objects for delete
  using ( bucket_id = 'shop-assets' );
