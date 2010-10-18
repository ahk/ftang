listen 8080 # by default Unicorn listens on port 8080
worker_processes 2 # this should be >= nr_cpus
#pid "/path/to/app/shared/pids/unicorn.pid"
app_dir = File.dirname(File.expand_path(__FILE__)) 
log_dir = File.join app_dir, 'log'

working_directory app_dir
stderr_path File.join(log_dir, 'development.log')
stdout_path File.join(log_dir, 'development.log')

